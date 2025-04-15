"use client";

import { createContext, useContext, useState, useEffect } from 'react';

// Initial default settings
const defaultSettings = {
    // Theme
    darkMode: false,

    // Request Configuration
    requestTimeout: 30000,  // 30 seconds
    responseSize: 50,  // MB

    // Default Headers
    defaultHeaders: [
        { id: 1, name: "Content-Type", value: "application/json" },
        { id: 2, name: "Authorization", value: "Bearer YOUR_TOKEN_HERE" },
    ],

    // Proxy Settings
    proxyEnabled: false,
    proxyUrl: "",
    proxyUsername: "",
    proxyPassword: "",

    // API Keys
    apiKeys: [
        { id: 1, name: "Production API Key", value: "" },
        { id: 2, name: "Test API Key", value: "" },
    ],

    // Response Formatting
    jsonIndentation: "2",
    defaultResponseView: "pretty",
    wrapLines: true,
    highlightSyntax: true,
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    // Try to load settings from localStorage if available
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('apiTesterSettings');
            if (savedSettings) {
                try {
                    return JSON.parse(savedSettings);
                } catch (error) {
                    console.error('Failed to parse saved settings:', error);
                    return defaultSettings;
                }
            }
        }
        return defaultSettings;
    });

    // Update a single setting
    const updateSetting = (key, value) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: value
        }));
    };

    // Update multiple settings at once
    const updateSettings = (newSettings) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            ...newSettings
        }));
    };

    // Save settings to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('apiTesterSettings', JSON.stringify(settings));
        }
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
