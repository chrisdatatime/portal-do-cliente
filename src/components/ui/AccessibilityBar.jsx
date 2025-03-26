// src/components/ui/AccessibilityBar.jsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Barra de acessibilidade com controles para ajustar o tema e tamanho da fonte
 */
const AccessibilityBar = ({ className = '', showOnMobile = false }) => {
    // Estados do contexto de tema
    const {
        isDarkMode,
        toggleDarkMode,
        highContrast,
        toggleHighContrast,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize
    } = useTheme();

    // Estado para controlar se o menu está expandido em dispositivos móveis
    const [expanded, setExpanded] = useState(false);

    // Função para alternar a expansão em dispositivos móveis
    const toggleExpanded = () => {
        setExpanded(prev => !prev);
    };

    // Classe para controlar a visibilidade em dispositivos móveis
    const mobileClass = showOnMobile ? '' : 'hidden md:flex';

    // Estrutura do componente
    return (
        <div className={`${className} ${mobileClass} ${expanded ? 'expanded' : ''}`}>
            {/* Botão para expandir em dispositivos móveis */}
            <button
                className="md:hidden accessibility-toggle-button"
                onClick={toggleExpanded}
                aria-expanded={expanded}
                aria-label="Opções de acessibilidade"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    <line x1="12" y1="2" x2="12" y2="4"></line>
                    <line x1="12" y1="16" x2="12" y2="18"></line>
                </svg>
            </button>

            {/* Container para os controles de acessibilidade */}
            <div className={`accessibility-controls ${expanded ? 'visible' : ''}`}>
                <div className="accessibility-item">
                    <button
                        onClick={toggleDarkMode}
                        aria-pressed={isDarkMode}
                        aria-label={isDarkMode ? "Desativar modo escuro" : "Ativar modo escuro"}
                        className="accessibility-button"
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                        <span className="accessibility-label">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
                    </button>
                </div>

                <div className="accessibility-item">
                    <button
                        onClick={toggleHighContrast}
                        aria-pressed={highContrast}
                        aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
                        className="accessibility-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2v20"></path>
                            <path d="M2 12h20"></path>
                        </svg>
                        <span className="accessibility-label">{highContrast ? 'Contraste Normal' : 'Alto Contraste'}</span>
                    </button>
                </div>

                <div className="accessibility-item font-controls">
                    <span className="font-size-label" id="font-size-label">Tamanho do texto:</span>
                    <div className="font-size-buttons" aria-labelledby="font-size-label">
                        <button
                            onClick={decreaseFontSize}
                            aria-label="Diminuir tamanho do texto"
                            disabled={fontSize === 'small'}
                            className="font-size-button"
                        >
                            A<sup>-</sup>
                        </button>

                        <button
                            onClick={resetFontSize}
                            aria-label="Tamanho de texto padrão"
                            className="font-size-button reset"
                        >
                            A
                        </button>

                        <button
                            onClick={increaseFontSize}
                            aria-label="Aumentar tamanho do texto"
                            disabled={fontSize === 'x-large'}
                            className="font-size-button"
                        >
                            A<sup>+</sup>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityBar;