'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { simpleLogout } from '@/lib/simple-auth';

const LogoutButton = ({ className = '', showText = true }) => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // Usar a função de logout da lib de autenticação
            await simpleLogout();

            // Redirecionar para a página de login
            router.push('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Forçar redirecionamento mesmo em caso de erro
            router.push('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className={`logout-button ${className}`}
            aria-label="Sair do sistema"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {showText && <span>Sair</span>}
        </button>
    );
};

export default LogoutButton;