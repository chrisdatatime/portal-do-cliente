'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { isAdmin } from '@/lib/simple-auth';
import '@/styles/admin.css';

// Definição de tabs para o painel administrativo
type AdminTab = 'users' | 'connections' | 'workspaces' | 'settings';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('connections');
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
                    // Redirecionar usuários não-administradores para o dashboard
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
        settings: <SettingsManagement />
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

// Componente de gerenciamento de usuários
const UserManagement: React.FC = () => {
    return (
        <div className="admin-section">
            <h2>Gerenciamento de Usuários</h2>
            <p className="admin-description">
                Gerencie usuários, permissões e grupos de acesso.
            </p>

            {/* Conteúdo do componente UserManagement */}
            <div className="admin-placeholder">
                <span>Conteúdo do gerenciamento de usuários</span>
            </div>
        </div>
    );
};

// Componente de gerenciamento de conexões
const ConnectionsManagement: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="admin-section">
            <div className="admin-section-header">
                <h2>Gerenciamento de Conexões</h2>
                <button
                    className="admin-button primary"
                    onClick={() => setShowModal(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nova Conexão
                </button>
            </div>

            <p className="admin-description">
                Configure e gerencie as integrações com plataformas externas.
            </p>

            {/* Lista de conexões */}
            <div className="admin-card-grid">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="connection-logo">
                            {/* Placeholder para logo */}
                            <div className="placeholder-logo">ML</div>
                        </div>
                        <div className="connection-info">
                            <h3>Mercado Livre</h3>
                            <span className="connection-type">E-commerce</span>
                        </div>
                        <div className="connection-status active">
                            <span className="status-dot"></span>
                            Funcionando
                        </div>
                    </div>
                    <div className="admin-card-content">
                        <p>Integração com a API do Mercado Livre para consulta de produtos, pedidos e métricas de vendas.</p>
                        <div className="connection-details">
                            <div className="detail-item">
                                <span className="detail-label">API Key:</span>
                                <span className="detail-value">••••••••••••1234</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Última sincronização:</span>
                                <span className="detail-value">26/03/2025 14:30</span>
                            </div>
                        </div>
                    </div>
                    <div className="admin-card-footer">
                        <button className="admin-button secondary">Editar</button>
                        <button className="admin-button danger">Remover</button>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="connection-logo">
                            {/* Placeholder para logo */}
                            <div className="placeholder-logo">Meta</div>
                        </div>
                        <div className="connection-info">
                            <h3>Grupo Meta</h3>
                            <span className="connection-type">Redes Sociais</span>
                        </div>
                        <div className="connection-status failed">
                            <span className="status-dot"></span>
                            Falha
                        </div>
                    </div>
                    <div className="admin-card-content">
                        <p>Integração com Facebook, Instagram e WhatsApp para métricas de campanhas e engajamento.</p>
                        <div className="connection-details">
                            <div className="detail-item">
                                <span className="detail-label">API Key:</span>
                                <span className="detail-value">••••••••••••5678</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Última sincronização:</span>
                                <span className="detail-value">25/03/2025 10:15</span>
                            </div>
                            <div className="detail-item error">
                                <span className="detail-label">Erro:</span>
                                <span className="detail-value">Token de acesso expirado</span>
                            </div>
                        </div>
                    </div>
                    <div className="admin-card-footer">
                        <button className="admin-button secondary">Editar</button>
                        <button className="admin-button danger">Remover</button>
                    </div>
                </div>

                {/* Adicione mais cards conforme necessário */}
            </div>

            {/* Modal de adição de conexão */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Nova Conexão</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="admin-modal-content">
                            <form className="admin-form">
                                <div className="admin-form-group">
                                    <label htmlFor="connection-type">Tipo de Conexão</label>
                                    <select id="connection-type">
                                        <option value="">Selecione o tipo</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="social">Redes Sociais</option>
                                        <option value="analytics">Analytics</option>
                                        <option value="crm">CRM</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="connection-name">Nome da Conexão</label>
                                    <input type="text" id="connection-name" placeholder="Ex: Mercado Livre" />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="connection-description">Descrição</label>
                                    <input type="text" id="connection-description" placeholder="Descreva a finalidade desta conexão" />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="connection-logo">Logo (URL)</label>
                                    <input type="text" id="connection-logo" placeholder="https://exemplo.com/logo.png" />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="connection-api-key">API Key</label>
                                    <input type="text" id="connection-api-key" placeholder="Chave de API" />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="connection-api-secret">API Secret</label>
                                    <input type="password" id="connection-api-secret" placeholder="Segredo da API" />
                                </div>

                                <div className="admin-form-actions">
                                    <button
                                        type="button"
                                        className="admin-button secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="admin-button primary">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente de gerenciamento de workspaces
const WorkspacesManagement: React.FC = () => {
    return (
        <div className="admin-section">
            <h2>Gerenciamento de Workspaces</h2>
            <p className="admin-description">
                Configure workspaces do Power BI e controle permissões de acesso.
            </p>

            {/* Conteúdo do componente WorkspacesManagement */}
            <div className="admin-placeholder">
                <span>Conteúdo do gerenciamento de workspaces</span>
            </div>
        </div>
    );
};

// Componente de configurações gerais
const SettingsManagement: React.FC = () => {
    return (
        <div className="admin-section">
            <h2>Configurações</h2>
            <p className="admin-description">
                Configure parâmetros gerais da plataforma.
            </p>

            {/* Conteúdo do componente SettingsManagement */}
            <div className="admin-placeholder">
                <span>Conteúdo de configurações gerais</span>
            </div>
        </div>
    );
};

export default AdminPage;