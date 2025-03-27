// src/components/admin/ConnectionsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import '@/styles/admin.css';

interface Connection {
    id: string;
    name: string;
    logo: string;
    status: 'active' | 'failed' | 'pending';
    lastSync: string;
    type: string;
    description?: string;
    config?: Record<string, any>;
}

export default function ConnectionsManagement() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        description: '',
        logo: '',
        api_key: '',
        api_secret: '',
    });

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/connections');

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddConnection = () => {
        setFormData({
            name: '',
            type: '',
            description: '',
            logo: '',
            api_key: '',
            api_secret: '',
        });
        setShowModal(true);
    };

    const handleEditConnection = (connection: Connection) => {
        setFormData({
            name: connection.name,
            type: connection.type,
            description: connection.description || '',
            logo: connection.logo,
            api_key: connection.config?.api_key || '',
            api_secret: connection.config?.api_secret || '',
        });
        setShowModal(true);
    };

    const handleConfirmDelete = (connection: Connection) => {
        setConnectionToDelete(connection);
        setShowDeleteConfirm(true);
    };

    const handleSaveConnection = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type) {
            setError('Nome e tipo são campos obrigatórios');
            return;
        }

        try {
            setLoading(true);

            const connectionData = {
                name: formData.name,
                type: formData.type,
                description: formData.description,
                logo: formData.logo,
                config: {
                    api_key: formData.api_key,
                    api_secret: formData.api_secret,
                }
            };

            const response = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connectionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Conexão salva com sucesso!');
            setShowModal(false);
            await fetchConnections();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao salvar conexão: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConnection = async () => {
        if (!connectionToDelete) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/connections/${connectionToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Conexão excluída com sucesso!');
            setShowDeleteConfirm(false);
            await fetchConnections();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao excluir conexão: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciamento de Conexões</h2>
                <button
                    className="admin-button primary"
                    onClick={handleAddConnection}
                >
                    Nova Conexão
                </button>
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

            {loading && connections.length === 0 ? (
                <div className="admin-loading">Carregando conexões...</div>
            ) : (
                <div className="admin-card-grid">
                    {connections.length === 0 ? (
                        <div className="admin-no-data">
                            <p>Nenhuma conexão encontrada.</p>
                            <button
                                className="admin-button primary"
                                onClick={handleAddConnection}
                            >
                                Adicionar Conexão
                            </button>
                        </div>
                    ) : (
                        connections.map(connection => (
                            <div key={connection.id} className="admin-card">
                                <div className="admin-card-header">
                                    <div className="connection-logo">
                                        <Image
                                            src={connection.logo || "/logos/globe.svg"}
                                            alt={connection.name}
                                            width={40}
                                            height={40}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className="connection-info">
                                        <h3>{connection.name}</h3>
                                        <span className="connection-type">{connection.type}</span>
                                    </div>
                                    <div className={`connection-status ${connection.status}`}>
                                        <span className="status-dot"></span>
                                        {connection.status === 'active' && 'Funcionando'}
                                        {connection.status === 'failed' && 'Falha'}
                                        {connection.status === 'pending' && 'Pendente'}
                                    </div>
                                </div>
                                <div className="admin-card-content">
                                    <p>{connection.description}</p>
                                    <div className="connection-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Última sincronização:</span>
                                            <span className="detail-value">{formatDate(connection.lastSync)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-card-footer">
                                    <button
                                        className="admin-button secondary"
                                        onClick={() => handleEditConnection(connection)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="admin-button danger"
                                        onClick={() => handleConfirmDelete(connection)}
                                    >
                                        Remover
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal para adicionar/editar conexão */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>Nova Conexão</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-content">
                            <form className="admin-form" onSubmit={handleSaveConnection}>
                                <div className="admin-form-group">
                                    <label htmlFor="type">Tipo de Conexão *</label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="E-commerce">E-commerce</option>
                                        <option value="Redes Sociais">Redes Sociais</option>
                                        <option value="Analytics">Analytics</option>
                                        <option value="CRM">CRM</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="name">Nome da Conexão *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Mercado Livre"
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="description">Descrição</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Descreva a finalidade desta conexão"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="logo">Logo (URL)</label>
                                    <input
                                        type="text"
                                        id="logo"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleInputChange}
                                        placeholder="https://exemplo.com/logo.png"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="api_key">API Key</label>
                                    <input
                                        type="text"
                                        id="api_key"
                                        name="api_key"
                                        value={formData.api_key}
                                        onChange={handleInputChange}
                                        placeholder="Chave de API"
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="api_secret">API Secret</label>
                                    <input
                                        type="password"
                                        id="api_secret"
                                        name="api_secret"
                                        value={formData.api_secret}
                                        onChange={handleInputChange}
                                        placeholder="Segredo da API"
                                    />
                                </div>

                                <div className="admin-form-actions">
                                    <button
                                        type="button"
                                        className="admin-button secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="admin-button primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmação de exclusão */}
            {showDeleteConfirm && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal confirm-modal">
                        <div className="admin-modal-header">
                            <h3>Confirmar Exclusão</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="admin-modal-content">
                            <p>
                                Tem certeza que deseja excluir a conexão <strong>{connectionToDelete?.name}</strong>?
                            </p>
                            <p className="warning-text">Esta ação não pode ser desfeita.</p>
                        </div>

                        <div className="admin-form-actions">
                            <button
                                type="button"
                                className="admin-button secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="admin-button danger"
                                onClick={handleDeleteConnection}
                                disabled={loading}
                            >
                                {loading ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}