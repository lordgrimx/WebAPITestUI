"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAxios } from './auth-context';
import { toast } from 'sonner';

// Initial default environment state
const defaultEnvironmentState = {
    environments: [],
    currentEnvironmentId: null,
    currentEnvironment: null
};

const EnvironmentContext = createContext(null);

export const EnvironmentProvider = ({ children }) => {
    const [environmentState, setEnvironmentState] = useState(defaultEnvironmentState);
    const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to process variables and apply them to string values
    const processVariables = useCallback((text, variables = {}) => {
        if (!text || typeof text !== 'string' || !variables || Object.keys(variables).length === 0) {
            return text;
        }

        // Replace {{variableName}} with the actual value
        return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
            const trimmedName = variableName.trim();
            return variables[trimmedName] !== undefined ? variables[trimmedName] : match;
        });
    }, []);

    // Trigger a manual refresh of environment data
    const triggerEnvironmentChange = useCallback(() => {
        setRefreshTrigger(prevTrigger => prevTrigger + 1);
    }, []);

    // Set the current environment by ID
    const setCurrentEnvironmentById = useCallback(async (environmentId) => {
        try {
            setIsEnvironmentLoading(true);            // Update in backend using the correct endpoint and method
            await authAxios.put(`/environments/${environmentId}/activate`); // Changed from POST to PUT and updated URL

            // Explicitly sync history with the newly activated environment
            await authAxios.post(`/environments/${environmentId}/sync-history`);

            // Update in frontend state
            setEnvironmentState(prevState => {
                const selectedEnv = prevState.environments.find(env => env.id === environmentId);

                if (selectedEnv) {
                    // Store in localStorage for persistence
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('currentEnvironmentId', environmentId);
                    }

                    return {
                        ...prevState,
                        currentEnvironmentId: environmentId,
                        currentEnvironment: selectedEnv
                    };
                }

                return prevState;
            });

            toast.success("Environment updated successfully");
        } catch (error) {
            console.error("Error setting environment:", error);
            toast.error("Failed to update environment: " + (error.response?.data?.message || error.message));
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, []);    // Load available environments from the backend
    const loadEnvironments = useCallback(async () => {
        try {
            setIsEnvironmentLoading(true);

            // Fetch all environments
            const response = await authAxios.get('/environments');
            const environments = response.data;

            // Get the current environment id (from backend or localStorage)
            let currentId = null;

            // Try to get from backend first
            try {
                const currentResponse = await authAxios.get('/environments/active');
                currentId = currentResponse.data?.id;
            } catch (err) {
                console.log("No current environment set on server, using local storage");
            }

            // Fallback to localStorage if needed
            if (!currentId && typeof window !== 'undefined') {
                currentId = localStorage.getItem('currentEnvironmentId');
            }

            // Find the current environment object
            let currentEnvironment = currentId
                ? environments.find(env => env.id === parseInt(currentId))
                : environments[0]; // Default to first environment if none set

            // Handle case where saved environment ID no longer exists
            if (!currentEnvironment && environments.length > 0) {
                currentEnvironment = environments[0];
                currentId = currentEnvironment.id;
            }

            // Set the loaded state
            setEnvironmentState({
                environments,
                currentEnvironmentId: currentEnvironment?.id || null,
                currentEnvironment: currentEnvironment || null
            });

            // Update localStorage
            if (typeof window !== 'undefined') {
                if (currentEnvironment) {
                    localStorage.setItem('currentEnvironmentId', currentEnvironment.id);
                } else {
                    localStorage.removeItem('currentEnvironmentId');
                }
            }

        } catch (error) {
            console.error("Error loading environments:", error);
            toast.error("Failed to load environments: " + (error.response?.data?.message || error.message));
            // Clear state to avoid stale data
            setEnvironmentState(defaultEnvironmentState);
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, []);

    // Load environments on initial render and when refresh is triggered
    useEffect(() => {
        loadEnvironments();
    }, [loadEnvironments, refreshTrigger]);    // Function to apply environment variables to a request
    const applyEnvironmentToRequest = useCallback((requestData) => {
        if (!environmentState.currentEnvironment?.variables || Object.keys(environmentState.currentEnvironment.variables).length === 0) {
            return requestData;
        }

        const variables = environmentState.currentEnvironment.variables;
        const result = { ...requestData };

        // Process URL
        if (result.url) {
            result.url = processVariables(result.url, variables);
        }

        // Process headers
        if (result.headers) {
            try {
                let headers = typeof result.headers === 'string'
                    ? JSON.parse(result.headers)
                    : result.headers;

                headers = headers.map(header => ({
                    ...header,
                    key: processVariables(header.key, variables),
                    value: processVariables(header.value, variables)
                }));

                result.headers = JSON.stringify(headers);
            } catch (error) {
                console.error("Failed to process headers with environment variables:", error);
            }
        }

        // Process params
        if (result.params) {
            try {
                let params = typeof result.params === 'string'
                    ? JSON.parse(result.params)
                    : result.params;

                params = params.map(param => ({
                    ...param,
                    key: processVariables(param.key, variables),
                    value: processVariables(param.value, variables)
                }));

                result.params = JSON.stringify(params);
            } catch (error) {
                console.error("Failed to process params with environment variables:", error);
            }
        }

        // Process body if it's a string (JSON or text)
        if (result.body && typeof result.body === 'string') {
            result.body = processVariables(result.body, variables);
        }

        return result;
    }, [environmentState.currentEnvironment, processVariables]);    // Function to delete an environment by ID
    const deleteEnvironment = useCallback(async (environmentId) => {
        try {
            setIsEnvironmentLoading(true);

            // Delete the environment in the backend
            const response = await authAxios.delete(`/environments/${environmentId}`);

            // The API now returns the newly activated environment and updated environments list
            const { activeEnvironment, environments: updatedEnvironments } = response.data;

            // Update the frontend state with the data from the backend
            setEnvironmentState({
                environments: updatedEnvironments || [],
                currentEnvironmentId: activeEnvironment?.id || null,
                currentEnvironment: activeEnvironment || null
            });

            // Update localStorage
            if (typeof window !== 'undefined') {
                if (activeEnvironment?.id) {
                    localStorage.setItem('currentEnvironmentId', activeEnvironment.id);
                } else {
                    localStorage.removeItem('currentEnvironmentId');
                }
            }

            toast.success("Environment deleted successfully");

        } catch (error) {
            console.error("Error deleting environment:", error);
            toast.error("Failed to delete environment: " + (error.response?.data?.message || error.message));

            // If there was an error, refresh environments to ensure UI is in sync
            await loadEnvironments();
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, [loadEnvironments]);    // Function to synchronize history entries with an environment
    const syncHistoryWithEnvironment = useCallback(async (environmentId) => {
        try {
            setIsEnvironmentLoading(true);

            // Call the sync endpoint
            const response = await authAxios.post(`/environments/${environmentId}/sync-history`);

            if (response.status === 200) {
                toast.success("History entries synchronized successfully with environment");
                return true;
            } else {
                toast.error("Failed to synchronize history entries with environment");
                return false;
            }
        } catch (error) {
            console.error("Error syncing history with environment:", error);
            toast.error("Failed to sync history: " + (error.response?.data?.message || error.message));
            return false;
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, []);

    return (
        <EnvironmentContext.Provider value={{
            ...environmentState,
            isEnvironmentLoading,
            setCurrentEnvironmentById,
            triggerEnvironmentChange,
            refreshEnvironments: loadEnvironments,
            processVariables,
            applyEnvironmentToRequest,
            deleteEnvironment,
            syncHistoryWithEnvironment
        }}>
            {children}
        </EnvironmentContext.Provider>
    );
};

export const useEnvironment = () => {
    const context = useContext(EnvironmentContext);
    if (!context) {
        throw new Error('useEnvironment must be used within an EnvironmentProvider');
    }
    return context;
};
