"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAxios, useAuth } from './auth-context';
import { toast } from 'sonner';

// Initial default environment state
const defaultEnvironmentState = {
    environments: [],
    currentEnvironmentId: null,
    currentEnvironment: null
};

const EnvironmentContext = createContext(null);

// Add a debounce utility function at the top of the file
function debounce(func, wait) {
    let timeout;
    const debouncedFunction = function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
    
    debouncedFunction.cancel = function() {
        clearTimeout(timeout);
    };
    
    return debouncedFunction;
}

export const EnvironmentProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [environmentState, setEnvironmentState] = useState(defaultEnvironmentState);
    const [isEnvironmentLoading, setIsEnvironmentLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hasAuthError, setHasAuthError] = useState(false);

    // Memoize processVariables to prevent recreation on each render
    const processVariables = useCallback((text, variables = {}) => {
        if (!text || typeof text !== 'string' || !variables || Object.keys(variables).length === 0) {
            return text;
        }

        // Replace {{variableName}} with the actual value
        return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
            const trimmedName = variableName.trim();
            // Güvenli erişim için Object.prototype.hasOwnProperty kullan
            return Object.prototype.hasOwnProperty.call(variables, trimmedName) ? variables[trimmedName] : match;
        });
    }, []);

    // Trigger a manual refresh of environment data
    const triggerEnvironmentChange = useCallback(() => {
        setRefreshTrigger(prevTrigger => prevTrigger + 1);
    }, []);

    // Set the current environment by ID
    const setCurrentEnvironmentById = useCallback(async (environmentId) => {
        if (!isAuthenticated || hasAuthError) return; // Prevent API calls if not authenticated
        
        try {
            setIsEnvironmentLoading(true);            // Update in backend using the correct endpoint and method
            await authAxios.put(`/environments/${environmentId}/activate`); // Changed from POST to PUT and updated URL

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
            if (error.response?.status === 401) {
                setHasAuthError(true); // Set flag to prevent more API calls
            } else {
                toast.error("Failed to update environment: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, [isAuthenticated, hasAuthError]);

    // Load available environments from the backend
    const loadEnvironments = useCallback(async () => {
        if (!isAuthenticated || hasAuthError) {
            setIsEnvironmentLoading(false);
            return; // Skip API calls if not authenticated
        }
        
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
            if (error.response?.status === 401) {
                setHasAuthError(true); // Set flag to prevent more API calls
            } else {
                toast.error("Failed to load environments: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, [isAuthenticated, hasAuthError]);

    // Add a debounce for environment changes
    const debouncedLoadEnvironments = useCallback(
        debounce(() => {
            if (isAuthenticated && !hasAuthError) {
                loadEnvironments();
            }
        }, 300),
        [loadEnvironments, isAuthenticated, hasAuthError]
    );

    // Reset auth error state when authentication status changes
    useEffect(() => {
        if (isAuthenticated) {
            setHasAuthError(false);
        } else {
            // Reset state when user is not authenticated
            setEnvironmentState(defaultEnvironmentState);
        }
    }, [isAuthenticated]);

    // Load environments on initial render and when refresh is triggered or auth state changes
    useEffect(() => {
        debouncedLoadEnvironments();
        // Clean up the debounce on unmount
        return () => debouncedLoadEnvironments.cancel();
    }, [debouncedLoadEnvironments, refreshTrigger]);

    const deleteEnvironment = useCallback(async (environmentId) => {
        if (!isAuthenticated || hasAuthError) {
            toast.error("Authentication error. Cannot delete environment.");
            return;
        }
        setIsEnvironmentLoading(true);
        try {
            await authAxios.delete(`/environments/${environmentId}`);
            toast.success("Environment deleted successfully");
            triggerEnvironmentChange(); // Refresh the environments list
            // If the deleted environment was the current one, reset current environment
            if (environmentState.currentEnvironmentId === environmentId) {
                setEnvironmentState(prevState => ({
                    ...prevState,
                    currentEnvironmentId: null,
                    currentEnvironment: null
                }));
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('currentEnvironmentId');
                }
            }
        } catch (error) {
            console.error("Error deleting environment:", error);
            toast.error("Failed to delete environment: " + (error.response?.data?.message || error.message));
        } finally {
            setIsEnvironmentLoading(false);
        }
    }, [isAuthenticated, hasAuthError, triggerEnvironmentChange, environmentState.currentEnvironmentId]);

    // Function to apply environment variables to a request
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
    }, [environmentState.currentEnvironment, processVariables]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        environments: environmentState.environments,
        currentEnvironment: environmentState.currentEnvironment,
        isEnvironmentLoading,
        setCurrentEnvironmentById,
        refreshEnvironments: triggerEnvironmentChange, // Expose trigger as refreshEnvironments
        applyEnvironmentToRequest,
        triggerEnvironmentChange, // also expose the original trigger if needed elsewhere
        processVariables, // expose processVariables
        deleteEnvironment // expose deleteEnvironment
    }), [
        environmentState.environments,
        environmentState.currentEnvironment,
        isEnvironmentLoading,
        setCurrentEnvironmentById,
        triggerEnvironmentChange,
        applyEnvironmentToRequest,
        processVariables,
        deleteEnvironment
    ]);

    return (
        <EnvironmentContext.Provider value={contextValue}>
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
