// src/app/admin/page.tsx
'use client';


import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { isAdmin } from '@/lib/simple-auth';
import UserManagement from '@/components/admin/UserManagement';
import ConnectionsManagement from '@/components/admin/ConnectionsManagement';
import WorkspacesManagement from '@/components/admin/WorkspacesManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import CompanyManagement from '@/components/admin/CompanyManagement';
import '@/styles/admin.css';


// Definição de tabs para o painel administrativo
type AdminTab = 'users' | 'connections' | 'workspaces' | 'settings' | 'companies';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Verificar se o usuário tem permissões de administrador
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                setIsLoading(true);
                const admin = await isAdmin();

                if (!admin) {
                    router.push('/dashboard');
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error('Erro ao verificar permissões de administrador:', error);
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    // Componentes para cada tab
    const TabComponents = {
        users: <UserManagement />,
        connections: <ConnectionsManagement />,
        workspaces: <WorkspacesManagement />,
        settings: <SettingsManagement />,
        companies: <CompanyManagement />  // Adicione esta linha
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando painel administrativo...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!isAuthorized) {
        return null; // O useEffect vai redirecionar
    }

    return (
        <DashboardLayout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Painel de Administração</h1>
                </div>

                <div className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Usuários
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'connections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Conexões
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'workspaces' ? 'active' : ''}`}
                        onClick={() => setActiveTab('workspaces')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Workspaces
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'companies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('companies')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Empresas
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Configurações
                    </button>
                </div>

                <div className="admin-content">
                    {TabComponents[activeTab]}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPage;