// src/components/ui/FeedbackMessage.jsx
'use client';

import React, { useState, useEffect } from 'react';

/**
 * Componente para exibir mensagens de feedback com animações e auto-dismiss
 */
const FeedbackMessage = ({
    message,
    type = 'info', // 'success', 'error', 'info', 'warning'
    duration = 5000, // tempo em ms para auto-dismiss, 0 para persistir
    onDismiss,
    icon = true,
    className = '',
}) => {
    const [visible, setVisible] = useState(true);

    // Auto-dismiss após a duração especificada
    useEffect(() => {
        if (duration > 0 && visible) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onDismiss) onDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, visible, onDismiss]);

    // Ícone apropriado baseado no tipo de mensagem
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                );
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                );
            case 'warning':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                );
        }
    };

    // Ação de dismiss
    const handleDismiss = () => {
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!visible) return null;

    return (
        <div
            className={`feedback-message ${type} ${className}`}
            role="alert"
            aria-live="assertive"
        >
            {icon && (
                <div className="mr-3" aria-hidden="true">
                    {getIcon()}
                </div>
            )}

            <div className="flex-grow">{message}</div>

            <button
                onClick={handleDismiss}
                className="ml-3 text-current opacity-70 hover:opacity-100 focus:outline-none"
                aria-label="Fechar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

export default FeedbackMessage;