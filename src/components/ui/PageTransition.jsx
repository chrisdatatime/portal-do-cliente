// src/components/ui/PageTransition.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Componente que adiciona animações de transição para páginas e componentes
 * Requer a instalação da biblioteca framer-motion: npm install framer-motion
 */
const PageTransition = ({
    children,
    mode = 'default',  // default, fade, slide, none
    duration = 0.3
}) => {
    const [isClient, setIsClient] = useState(false);

    // Evitar problemas de hidratação no client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <>{children}</>;
    }

    // Configuração de variantes de animação com base no modo escolhido
    const variants = {
        default: {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 }
        },
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 }
        },
        slide: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 }
        },
        slideUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
        },
        none: {
            initial: {},
            animate: {},
            exit: {}
        }
    };

    // Usar o modo "none" em produção evita animações desnecessárias
    const selectedMode = process.env.NODE_ENV === 'production' && mode === 'default'
        ? 'none'
        : mode;

    const selectedVariant = variants[selectedMode] || variants.default;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={isClient ? window.location.pathname : 'initial'}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={selectedVariant}
                transition={{ duration, ease: 'easeInOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;