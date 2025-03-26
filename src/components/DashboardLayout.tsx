'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { simpleIsAuthenticated } from '@/lib/simple-auth';
import '@/styles/sidebar.css';
import '@/styles/dashboard.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = await simpleIsAuthenticated();
                if (!authenticated) {
                    router.push('/login');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar fixo no topo com z-index alto */}
            <Navbar />

            <div className="flex">
                {/* Sidebar à esquerda com z-index médio */}
                <div className="sidebar-container" style={{ zIndex: 90 }}>
                    <Sidebar />
                </div>

                {/* Conteúdo principal com padding para compensar a navbar e sidebar */}
                <main className="flex-1 p-6 mt-16 transition-all duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;