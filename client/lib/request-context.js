'use client';

import { createContext, useContext, useState } from 'react';

const RequestContext = createContext(null);

export function RequestProvider({ children }) {
    const [currentRequestData, setCurrentRequestData] = useState(null);

    return (
        <RequestContext.Provider value={{ currentRequestData, setCurrentRequestData }}>
            {children}
        </RequestContext.Provider>
    );
}

export const useRequest = () => {
    const context = useContext(RequestContext);
    if (!context) {
        throw new Error('useRequest must be used within a RequestProvider');
    }
    return context;
};
