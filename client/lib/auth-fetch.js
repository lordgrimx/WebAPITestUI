"use client";

import axios from 'axios';

// Create an authenticated axios instance
const createAuthenticatedAxios = () => {
    const instance = axios.create();

    // Add auth token to all requests from localStorage
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token'); // Use localStorage
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create a fetch wrapper that adds auth headers from localStorage
export const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token'); // Use localStorage

    const headers = {
        ...options.headers,
    };

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Return the fetch call with modified headers
    return fetch(url, {
        ...options,
        credentials: 'include', // Always include credentials
        headers,
    });
};

// Export an authenticated axios instance
export const authAxios = createAuthenticatedAxios();

export default { authenticatedFetch, authAxios };
