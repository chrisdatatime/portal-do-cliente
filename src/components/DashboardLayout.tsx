'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { simpleIsAuthenticated } from '@/lib/simple-auth';
import '@/styles/sidebar.css';

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
        <div className="main-layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;