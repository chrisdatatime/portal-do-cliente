'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Image from 'next/image';
import '@/styles/admin.css';

interface Connection {
    id: string;
    name: string;
    logo: string;
    status: 'active' | 'failed' | 'pending';
    lastSync?: string;
    type: string;
    description?: string;
    config?: Record<string, any>;
}

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminStatus();
        fetchConnections();
    }, []);

    const checkAdminStatus = async () => {
        try {
            // Verificar se o usuário é admin via localStorage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setIsAdmin(user.role === 'admin' || user.isAdmin === true);
            }
        } catch (err) {
            console.error('Erro ao verificar status de admin:', err);
        }
    };

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await fetch('/connections/api');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setConnections(data || []);
            setError('');
        } catch (err: any) {
            setError('Erro ao carregar conexões: ' + (err.message || 'Falha na requisição'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConnection = async (connectionId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta conexão?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/connections/api/${connectionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Conexão excluída com sucesso!');
            await fetchConnections();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao excluir conexão: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Funcionando';
            case 'failed': return 'Falha';
            case 'pending': return 'Pendente';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'status-normal';
            case 'failed': return 'status-error';
            case 'pending': return 'status-pending';
            default: return '';
        }
    };

    return (
        <DashboardLayout>
            <div className="admin-container">
                <div className="admin-header">
                    <h1>API setup status</h1>
                    {isAdmin && (
                        <button
                            className="connection-new-button"
                            onClick={() => window.location.href = '/admin?tab=connections'}
                        >
                            + New registration
                        </button>
                    )}
                </div>

                {error && (
                    <div className="admin-alert error">
                        <span>{error}</span>
                        <button onClick={() => setError('')}>×</button>
                    </div>
                )}

                {successMessage && (
                    <div className="admin-alert success">
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')}>×</button>
                    </div>
                )}

                <div className="connections-filter-bar">
                    <div className="filter-group">
                        <label>Sales Site</label>
                        <select>
                            <option>All</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Connection Status</label>
                        <select>
                            <option>All</option>
                            <option>Funcionando</option>
                            <option>Falha</option>
                            <option>Pendente</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading">Carregando conexões...</div>
                ) : connections.length === 0 ? (
                    <div className="admin-no-data">
                        <p>Nenhuma conexão encontrada.</p>
                        {isAdmin && (
                            <button
                                className="connection-new-button"
                                onClick={() => window.location.href = '/admin?tab=connections'}
                            >
                                + New registration
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="connections-table-container">
                        <table className="connections-table">
                            <thead>
                                <tr>
                                    <th>Plataforma</th>
                                    <th>Domain</th>
                                    <th>Login ID</th>
                                    <th>Connection Status</th>
                                    <th>Order Collection</th>
                                    <th>Order Confirmation</th>
                                    <th>Fulfillment Center</th>
                                    <th>Auto Stock Qty Sync</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {connections.map(connection => (
                                    <tr key={connection.id}>
                                        <td>
                                            <div className="connection-platform">
                                                <Image
                                                    src={connection.logo || "/logos/globe.svg"}
                                                    alt={connection.name}
                                                    width={24}
                                                    height={24}
                                                    style={{ objectFit: 'contain' }}
                                                />
                                                <span>{connection.name}</span>
                                            </div>
                                        </td>
                                        <td>www.{connection.name.toLowerCase().replace(/\s+/g, '')}.com</td>
                                        <td>{connection.id.substring(0, 8)}</td>
                                        <td>
                                            <div className={`connection-status-badge ${getStatusClass(connection.status)}`}>
                                                <span className="status-dot"></span>
                                                {getStatusLabel(connection.status)}
                                            </div>
                                        </td>
                                        <td className="feature-status">{Math.random() > 0.5 ? 'Enabled' : 'Disabled'}</td>
                                        <td className="feature-status">{Math.random() > 0.5 ? 'Enabled' : 'Disabled'}</td>
                                        <td className="feature-status">{Math.random() > 0.5 ? 'Enabled' : 'Disabled'}</td>
                                        <td className="feature-status">{Math.random() > 0.5 ? 'Enabled' : 'Disabled'}</td>
                                        <td>
                                            <div className="connection-actions">
                                                <button
                                                    className="admin-button secondary action-button"
                                                    onClick={() => alert('Função de carregamento não implementada')}
                                                    title="Carregar Dados"
                                                >
                                                    <span className="material-icon">↻</span>
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="admin-button action-button"
                                                            onClick={() => window.location.href = `/admin?tab=connections&edit=${connection.id}`}
                                                            title="Editar"
                                                        >
                                                            <span className="material-icon">✏️</span>
                                                        </button>
                                                        <button
                                                            className="admin-button danger action-button"
                                                            onClick={() => handleDeleteConnection(connection.id)}
                                                            title="Excluir"
                                                        >
                                                            <span className="material-icon">🗑️</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="connections-table-footer">
                            <div className="rows-count">Rows: {connections.length}</div>
                            <div className="table-actions">
                                <button className="table-action-button">Excel</button>
                                <button className="table-action-button">↓</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
