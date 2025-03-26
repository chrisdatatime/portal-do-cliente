// src/components/ui/LoadingSpinner.jsx
import React from 'react';

/**
 * Componente de spinner de carregamento reutilizável com diferentes tamanhos e variantes
 */
const LoadingSpinner = ({ size = 'medium', variant = 'primary', fullPage = false, text = '' }) => {
    // Classes CSS baseadas nas props
    const sizeClasses = {
        small: 'w-4 h-4 border-2',
        medium: 'w-8 h-8 border-3',
        large: 'w-12 h-12 border-4'
    };

    const variantClasses = {
        primary: 'border-primary',
        secondary: 'border-gray-300',
        white: 'border-white'
    };

    const spinnerClass = `
    inline-block rounded-full border-t-transparent animate-spin
    ${sizeClasses[size] || sizeClasses.medium}
    ${variantClasses[variant] || variantClasses.primary}
  `;

    // Renderização baseada no modo (página inteira ou componente)
    if (fullPage) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
                <div className={spinnerClass}></div>
                {text && <p className="mt-4 text-gray-600 dark:text-gray-300">{text}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={spinnerClass}></div>
            {text && <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;