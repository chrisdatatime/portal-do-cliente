'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { isAdmin as checkIsAdmin } from '@/lib/simple-auth';
import '@/styles/connections.css';

// Tipo para conexões
interface Connection {
    id: string;
    name: string;
    logo: string;
    status: 'active' | 'failed' | 'pending';
    lastSync: string;
    type: string;
    description?: string;
}

const ConnectionsPage: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const admin = await checkIsAdmin();
                setIsAdmin(admin);
            } catch (error) {
                console.error('Erro ao verificar permissões de administrador:', error);
            }
        };

        checkAdmin();

        const fetchConnections = async () => {
            try {
                setIsLoading(true);

                // Aqui faremos a chamada para a API para buscar as conexões
                // Por enquanto, vamos usar dados de exemplo
                const response = await fetch('/api/connections');

                if (!response.ok) {
                    throw new Error('Falha ao carregar as conexões');
                }

                const data = await response.json();
                setConnections(data);

            } catch (err: any) {
                console.error('Erro ao carregar conexões:', err);
                setError(err.message || 'Ocorreu um erro ao carregar as conexões');
            } finally {
                setIsLoading(false);
            }
        };

        // Para fins de demonstração, usando dados estáticos
        const mockConnections: Connection[] = [
            {
                id: '1',
                name: 'Mercado Livre',
                logo: '/logos/globe.svg',
                status: 'active',
                lastSync: '2025-03-26T14:30:00Z',
                type: 'E-commerce',
                description: 'Integração com a API do Mercado Livre'
            },
            {
                id: '2',
                name: 'Grupo Meta',
                logo: '/logos/meta.svg',
                status: 'failed',
                lastSync: '2025-03-25T10:15:00Z',
                type: 'Redes Sociais',
                description: 'Integração com Facebook, Instagram e WhatsApp'
            },
            {
                id: '3',
                name: 'Google Analytics',
                logo: '/logos/google-analytics.svg',
                status: 'active',
                lastSync: '2025-03-26T12:45:00Z',
                type: 'Analytics',
                description: 'Métricas de tráfego e conversão do site'
            },
            {
                id: '4',
                name: 'Shopify',
                logo: '/logos/shopify.svg',
                status: 'pending',
                lastSync: '2025-03-24T16:20:00Z',
                type: 'E-commerce',
                description: 'Integração com a loja online Shopify'
            },
            {
                id: '5',
                name: 'HubSpot',
                logo: '/logos/hubspot.png',
                status: 'active',
                lastSync: '2025-03-26T09:00:00Z',
                type: 'CRM',
                description: 'Dados de clientes e vendas do CRM'
            }
        ];

        // Simular chamada de API
        setTimeout(() => {
            setConnections(mockConnections);
            setIsLoading(false);
        }, 1000);

    }, []);

    // Filtrar conexões com base na pesquisa
    const filteredConnections = connections.filter(connection =>
        connection.name.toLowerCase().includes(filter.toLowerCase()) ||
        connection.type.toLowerCase().includes(filter.toLowerCase()) ||
        connection.description?.toLowerCase().includes(filter.toLowerCase())
    );

    // Filtrar conexões com base na tab ativa
    const tabFilteredConnections = activeTab === 'all'
        ? filteredConnections
        : filteredConnections.filter(connection => connection.status === activeTab);

    const handleSync = (id: string) => {
        console.log(`Sincronizando conexão ${id}`);
        // Implementar lógica de sincronização aqui
    };

    const handleEdit = (id: string) => {
        console.log(`Editando conexão ${id}`);
        // Implementar navegação para edição de conexão
    };

    const handleDelete = (id: string) => {
        console.log(`Excluindo conexão ${id}`);
        // Implementar lógica de exclusão aqui
    };

    const addConnection = () => {
        console.log('Adicionando nova conexão');
        // Implementar navegação para adição de conexão
    };

    // Função para formatar a data de última sincronização
    const formatLastSync = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hora${Math.floor(diffInHours) !== 1 ? 's' : ''} atrás`;
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="connections-container">
                <div className="connections-header">
                    <h1>Conexões</h1>
                    <div className="header-actions">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Buscar conexões..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                aria-label="Buscar conexões"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        {isAdmin && (
                            <button
                                className="add-connection-button"
                                onClick={addConnection}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Adicionar Conexão
                            </button>
                        )}
                    </div>
                </div>

                <div className="connections-tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todas
                    </button>
                    <button
                        className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Ativas
                    </button>
                    <button
                        className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('failed')}
                    >
                        Com Falha
                    </button>
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pendentes
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando conexões...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Tentar novamente</button>
                    </div>
                ) : tabFilteredConnections.length === 0 ? (
                    <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <h3>Nenhuma conexão encontrada</h3>
                        <p>Não encontramos conexões correspondentes aos critérios de busca.</p>
                        {isAdmin && (
                            <button
                                className="add-connection-button mt-4"
                                onClick={addConnection}
                            >
                                Adicionar Conexão
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="connections-table-container">
                        <table className="connections-table">
                            <thead>
                                <tr>
                                    <th>Plataforma</th>
                                    <th>Tipo</th>
                                    <th>Status</th>
                                    <th>Última Sincronização</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabFilteredConnections.map(connection => (
                                    <tr key={connection.id}>
                                        <td className="platform-cell">
                                            <div className="platform-info">
                                                <div className="platform-logo">
                                                    <Image
                                                        src={connection.logo}
                                                        alt={connection.name}
                                                        width={32}
                                                        height={32}
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="platform-name">{connection.name}</div>
                                                    <div className="platform-description">{connection.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{connection.type}</td>
                                        <td>
                                            <span className={`status-badge ${connection.status}`}>
                                                {connection.status === 'active' && 'Funcionando'}
                                                {connection.status === 'failed' && 'Falha'}
                                                {connection.status === 'pending' && 'Pendente'}
                                            </span>
                                        </td>
                                        <td>{formatLastSync(connection.lastSync)}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="action-button sync"
                                                    onClick={() => handleSync(connection.id)}
                                                    title="Sincronizar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                                                    </svg>
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="action-button edit"
                                                            onClick={() => handleEdit(connection.id)}
                                                            title="Editar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="action-button delete"
                                                            onClick={() => handleDelete(connection.id)}
                                                            title="Excluir"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ConnectionsPage;