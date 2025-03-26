// src/contexts/LoadingContext.jsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Criar o contexto
const LoadingContext = createContext({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { },
    loadingText: '',
    setLoadingText: () => { }
});

// Hook personalizado para usar o contexto
export const useLoading = () => useContext(LoadingContext);

// Provedor do contexto
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = (text = '') => {
        setLoadingCount(prev => prev + 1);
        setIsLoading(true);
        if (text) setLoadingText(text);
    };

    const stopLoading = () => {
        setLoadingCount(prev => {
            const newCount = prev - 1;
            if (newCount <= 0) {
                setIsLoading(false);
                setLoadingText('');
                return 0;
            }
            return newCount;
        });
    };

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, loadingText, setLoadingText }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    {loadingText && <p className="mt-4 text-gray-600 dark:text-gray-300">{loadingText}</p>}
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export default LoadingContext;