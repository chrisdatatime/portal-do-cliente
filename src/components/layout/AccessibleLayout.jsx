// src/components/layout/AccessibleLayout.jsx
'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import AccessibilityBar from '@/components/ui/AccessibilityBar';
import PageTransition from '@/components/ui/PageTransition';

/**
 * Layout acessível com provedores de contexto, barra de acessibilidade e melhorias
 * para a experiência do usuário
 */
const AccessibleLayout = ({
    children,
    pageTitle,
    showAccessibilityBar = true,
    showSkipLink = true,
    mainId = 'main-content'
}) => {
    return (
        <ThemeProvider>
            <LoadingProvider>
                {/* Skip link para acessibilidade por teclado */}
                {showSkipLink && (
                    <a href={`#${mainId}`} className="skip-link">
                        Pular para o conteúdo principal
                    </a>
                )}

                {/* Barra de acessibilidade */}
                {showAccessibilityBar && (
                    <AccessibilityBar className="accessibility-bar" />
                )}

                {/* Conteúdo principal com metadados de acessibilidade */}
                <PageTransition>
                    {/* Título da página para SEO e acessibilidade */}
                    {pageTitle && (
                        <div className="sr-only" aria-live="polite">
                            {pageTitle}
                        </div>
                    )}

                    {/* Container do conteúdo principal com ID para skip link */}
                    <main id={mainId} tabIndex="-1">
                        {children}
                    </main>
                </PageTransition>
            </LoadingProvider>
        </ThemeProvider>
    );
};

export default AccessibleLayout;