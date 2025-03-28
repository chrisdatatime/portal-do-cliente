// src/components/admin/ConnectionsManagement.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
        api_key: '',
        api_secret: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchConnections();
    }, []);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Verificar tamanho e tipo
        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError('A imagem deve ter no máximo 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('O arquivo deve ser uma imagem');
            return;
        }

        // Exibir preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setLogoFile(file);
    };

    const handleLogoClear = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAddConnection = () => {
        setFormData({
            name: '',
            type: '',
            description: '',
            api_key: '',
            api_secret: '',
        });
        setLogoFile(null);
        setLogoPreview(null);
        setShowModal(true);
    };

    const handleEditConnection = (connection: Connection) => {
        setFormData({
            name: connection.name,
            type: connection.type,
            description: connection.description || '',
            api_key: connection.config?.api_key || '',
            api_secret: connection.config?.api_secret || '',
        });
        setLogoPreview(connection.logo);
        setLogoFile(null);
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

            // Usar FormData para enviar imagem
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('type', formData.type);

            if (formData.description) {
                formDataToSend.append('description', formData.description);
            }

            if (formData.api_key) {
                formDataToSend.append('api_key', formData.api_key);
            }

            if (formData.api_secret) {
                formDataToSend.append('api_secret', formData.api_secret);
            }

            // Adicionar imagem caso tenha sido selecionada
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            const response = await fetch('/connections/api', {
                method: 'POST',
                body: formDataToSend,
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
            const response = await fetch(`/connections/api/${connectionToDelete.id}`, {
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

    const handleUpdateConnectionStatus = async (connection: Connection, newStatus: 'active' | 'failed' | 'pending') => {
        try {
            setLoading(true);
            const response = await fetch(`/connections/api/${connection.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage(`Status da conexão atualizado para ${getStatusLabel(newStatus)}`);
            await fetchConnections();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao atualizar status: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Funcionando';
            case 'failed': return 'Falha';
            case 'pending': return 'Pendente';
            default: return status;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
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
            ) : error ? (
                <div className="admin-error-display">
                    <p>Não foi possível carregar as conexões:</p>
                    <p>{error}</p>
                    <button
                        className="admin-button primary"
                        onClick={fetchConnections}
                    >
                        Tentar novamente
                    </button>
                </div>
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
                                        <div className="status-controls">
                                            <button
                                                className={`status-button ${connection.status === 'active' ? 'active' : ''}`}
                                                onClick={() => handleUpdateConnectionStatus(connection, 'active')}
                                                disabled={connection.status === 'active'}
                                                title="Marcar como funcionando"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className={`status-button ${connection.status === 'failed' ? 'active' : ''}`}
                                                onClick={() => handleUpdateConnectionStatus(connection, 'failed')}
                                                disabled={connection.status === 'failed'}
                                                title="Marcar como falha"
                                            >
                                                ✗
                                            </button>
                                            <button
                                                className={`status-button ${connection.status === 'pending' ? 'active' : ''}`}
                                                onClick={() => handleUpdateConnectionStatus(connection, 'pending')}
                                                disabled={connection.status === 'pending'}
                                                title="Marcar como pendente"
                                            >
                                                ⌛
                                            </button>
                                        </div>
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
                                    <label htmlFor="logo">Logo</label>
                                    <div className="logo-upload-container">
                                        {logoPreview && (
                                            <div className="logo-preview">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Preview"
                                                    width={100}
                                                    height={100}
                                                    style={{ objectFit: 'contain' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-logo-button"
                                                    onClick={handleLogoClear}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            ref={fileInputRef}
                                            className="file-input"
                                        />
                                        <label htmlFor="logo" className="file-input-label">
                                            {logoFile ? 'Trocar imagem' : 'Escolher imagem'}
                                        </label>
                                        <p className="file-input-help">
                                            Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 5MB
                                        </p>
                                    </div>
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