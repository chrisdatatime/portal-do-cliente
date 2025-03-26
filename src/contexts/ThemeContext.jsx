// src/contexts/ThemeContext.jsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Criar o contexto com valores e funções padrão
const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => { },
    highContrast: false,
    toggleHighContrast: () => { },
    fontSize: 'normal',
    increaseFontSize: () => { },
    decreaseFontSize: () => { },
    resetFontSize: () => { },
    announceToScreenReader: () => { }
});

// Hook para usar o contexto
export const useTheme = () => useContext(ThemeContext);

// Provedor do contexto
export const ThemeProvider = ({ children }) => {
    // Estado para modo escuro baseado na preferência do sistema
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Estado para alto contraste
    const [highContrast, setHighContrast] = useState(false);

    // Estado para tamanho da fonte - 'small', 'normal', 'large', 'x-large'
    const [fontSize, setFontSize] = useState('normal');

    // Anúncios para leitor de tela
    const [announcement, setAnnouncement] = useState('');

    // Verificar preferências do sistema no carregamento
    useEffect(() => {
        // Verificar preferência de tema escuro
        if (typeof window !== 'undefined') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setIsDarkMode(true);
            }

            // Verificar preferência salva no localStorage
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            const savedHighContrast = localStorage.getItem('highContrast') === 'true';
            const savedFontSize = localStorage.getItem('fontSize');

            if (savedDarkMode !== null) setIsDarkMode(savedDarkMode);
            if (savedHighContrast !== null) setHighContrast(savedHighContrast);
            if (savedFontSize) setFontSize(savedFontSize);

            // Ouvir mudanças no tema do sistema
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                if (localStorage.getItem('darkMode') === null) {
                    // Só atualiza automaticamente se o usuário não definiu uma preferência
                    setIsDarkMode(e.matches);
                }
            };

            // Adicionar event listener com compatibilidade para navegadores mais antigos
            if (darkModeMediaQuery.addEventListener) {
                darkModeMediaQuery.addEventListener('change', handleChange);
            } else if (darkModeMediaQuery.addListener) {
                // Para compatibilidade com navegadores mais antigos
                darkModeMediaQuery.addListener(handleChange);
            }

            return () => {
                if (darkModeMediaQuery.removeEventListener) {
                    darkModeMediaQuery.removeEventListener('change', handleChange);
                } else if (darkModeMediaQuery.removeListener) {
                    darkModeMediaQuery.removeListener(handleChange);
                }
            };
        }
    }, []);

    // Aplicar classes CSS baseado no estado atual
    useEffect(() => {
        if (typeof document !== 'undefined') {
            // Atualizar classes no documento
            const root = document.documentElement;

            // Gerenciar modo escuro
            if (isDarkMode) {
                root.classList.add('dark-mode');
            } else {
                root.classList.remove('dark-mode');
            }

            // Gerenciar alto contraste
            if (highContrast) {
                root.classList.add('high-contrast');
            } else {
                root.classList.remove('high-contrast');
            }

            // Gerenciar tamanho da fonte
            root.classList.remove('font-small', 'font-normal', 'font-large', 'font-x-large');
            root.classList.add(`font-${fontSize}`);

            // Salvar no localStorage
            localStorage.setItem('darkMode', isDarkMode);
            localStorage.setItem('highContrast', highContrast);
            localStorage.setItem('fontSize', fontSize);
        }
    }, [isDarkMode, highContrast, fontSize]);

    // Alternar modo escuro
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    // Alternar alto contraste
    const toggleHighContrast = () => {
        setHighContrast(prev => !prev);
    };

    // Gerenciar tamanho da fonte
    const increaseFontSize = () => {
        setFontSize(prev => {
            switch (prev) {
                case 'small': return 'normal';
                case 'normal': return 'large';
                case 'large': return 'x-large';
                default: return 'x-large';
            }
        });
    };

    const decreaseFontSize = () => {
        setFontSize(prev => {
            switch (prev) {
                case 'x-large': return 'large';
                case 'large': return 'normal';
                case 'normal': return 'small';
                default: return 'small';
            }
        });
    };

    const resetFontSize = () => {
        setFontSize('normal');
    };

    // Função para anunciar mensagens para leitores de tela
    const announceToScreenReader = (message) => {
        setAnnouncement(message);
        // Limpar o anúncio após 5 segundos
        setTimeout(() => setAnnouncement(''), 5000);
    };

    return (
        <ThemeContext.Provider
            value={{
                isDarkMode,
                toggleDarkMode,
                highContrast,
                toggleHighContrast,
                fontSize,
                increaseFontSize,
                decreaseFontSize,
                resetFontSize,
                announceToScreenReader
            }}
        >
            {children}
            {/* Região para anúncios de leitores de tela */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {announcement}
            </div>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;