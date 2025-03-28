'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import '@/styles/admin.css';

interface Dashboard {
    id: string;
    title: string;
    description?: string;
    category?: string;
    type?: string;
    embed_url: string;
    thumbnail?: string;
    created_at?: string;
    updated_at?: string;
    is_new: boolean;
    is_favorite: boolean;
    workspaces?: string[];
}

interface Workspace {
    id: string;
    name: string;
}

export default function DashboardsManagement() {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        type: '',
        embed_url: '',
        thumbnail: '',
        is_new: true,
        workspaces: [] as string[]
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);

    useEffect(() => {
        fetchDashboards();
        fetchWorkspaces();
    }, []);

    const fetchDashboards = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboards');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setDashboards(data);
            setError('');
        } catch (err: any) {
            setError('Erro ao carregar dashboards: ' + (err.message || 'Falha na requisição'));
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaces = async () => {
        try {
            const response = await fetch('/api/admin/workspaces');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setWorkspaces(data);
        } catch (err: any) {
            console.error('Erro ao carregar workspaces:', err);
            // Não bloquear a interface por falha em carregar workspaces
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({ ...prev, workspaces: selectedOptions }));
    };

    const handleAddDashboard = () => {
        setCurrentDashboard(null);
        setFormData({
            title: '',
            description: '',
            category: '',
            type: '',
            embed_url: '',
            thumbnail: '',
            is_new: true,
            workspaces: []
        });
        setShowModal(true);
    };

    const handleEditDashboard = (dashboard: Dashboard) => {
        setCurrentDashboard(dashboard);
        setFormData({
            title: dashboard.title,
            description: dashboard.description || '',
            category: dashboard.category || '',
            type: dashboard.type || '',
            embed_url: dashboard.embed_url,
            thumbnail: dashboard.thumbnail || '',
            is_new: dashboard.is_new,
            workspaces: dashboard.workspaces || []
        });
        setShowModal(true);
    };

    const handleConfirmDelete = (dashboard: Dashboard) => {
        setDashboardToDelete(dashboard);
        setShowDeleteConfirm(true);
    };

    const handleSaveDashboard = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.embed_url) {
            setError('Título e URL do embed são campos obrigatórios');
            return;
        }

        try {
            setLoading(true);

            const method = currentDashboard ? 'PUT' : 'POST';
            const url = currentDashboard
                ? `/api/admin/dashboards/${currentDashboard.id}`
                : '/api/admin/dashboards';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage(currentDashboard ? 'Dashboard atualizado com sucesso!' : 'Dashboard criado com sucesso!');
            setShowModal(false);
            await fetchDashboards();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao salvar dashboard: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDashboard = async () => {
        if (!dashboardToDelete) return;

        try {
            setLoading(true);

            const response = await fetch(`/api/admin/dashboards/${dashboardToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Dashboard excluído com sucesso!');
            setShowDeleteConfirm(false);
            await fetchDashboards();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao excluir dashboard: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciamento de Dashboards</h2>
                <button
                    className="admin-button primary"
                    onClick={handleAddDashboard}
                >
                    Novo Dashboard
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

            {loading && dashboards.length === 0 ? (
                <div className="admin-loading">Carregando dashboards...</div>
            ) : error ? (
                <div className="admin-error-display">
                    <p>Não foi possível carregar os dashboards:</p>
                    <p>{error}</p>
                    <button
                        className="admin-button primary"
                        onClick={fetchDashboards}
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : (
                <div className="admin-card-grid">
                    {dashboards.length === 0 ? (
                        <div className="admin-no-data">
                            <p>Nenhum dashboard encontrado</p>
                            <button
                                className="admin-button primary"
                                onClick={handleAddDashboard}
                            >
                                Adicionar Dashboard
                            </button>
                        </div>
                    ) : (
                        dashboards.map(dashboard => (
                            <div key={dashboard.id} className="admin-card">
                                <div className="admin-card-header">
                                    <div className="connection-logo">
                                        {dashboard.thumbnail ? (
                                            <Image
                                                src={dashboard.thumbnail}
                                                alt={dashboard.title}
                                                width={40}
                                                height={40}
                                                style={{ objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <span>{dashboard.title.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="connection-info">
                                        <h3>{dashboard.title}</h3>
                                        <span className="connection-type">{dashboard.type || 'Dashboard'}</span>
                                    </div>
                                    {dashboard.is_new && (
                                        <div className="new-indicator">Novo</div>
                                    )}
                                </div>
                                <div className="admin-card-content">
                                    <p>{dashboard.description}</p>
                                    <div className="connection-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Categoria:</span>
                                            <span className="detail-value">{dashboard.category || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Criado em:</span>
                                            <span className="detail-value">{formatDate(dashboard.created_at)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Workspaces:</span>
                                            <span className="detail-value">
                                                {dashboard.workspaces && dashboard.workspaces.length > 0
                                                    ? dashboard.workspaces.length
                                                    : 'Nenhum'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-card-footer">
                                    <button
                                        className="admin-button secondary"
                                        onClick={() => handleEditDashboard(dashboard)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="admin-button danger"
                                        onClick={() => handleConfirmDelete(dashboard)}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal para adicionar/editar dashboard */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{currentDashboard ? 'Editar Dashboard' : 'Novo Dashboard'}</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-content">
                            <form className="admin-form" onSubmit={handleSaveDashboard}>
                                <div className="admin-form-group">
                                    <label htmlFor="title">Título *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Título do dashboard"
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
                                        placeholder="Descreva o dashboard"
                                    />
                                </div>

                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label htmlFor="category">Categoria</label>
                                        <input
                                            type="text"
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            placeholder="Ex: marketing, financeiro"
                                        />
                                    </div>

                                    <div className="admin-form-group">
                                        <label htmlFor="type">Tipo</label>
                                        <input
                                            type="text"
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Dashboard, Relatório"
                                        />
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="embed_url">URL do Embed *</label>
                                    <input
                                        type="text"
                                        id="embed_url"
                                        name="embed_url"
                                        value={formData.embed_url}
                                        onChange={handleInputChange}
                                        placeholder="URL do Power BI ou outra ferramenta"
                                        required
                                    />
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="thumbnail">URL da Imagem de Miniatura</label>
                                    <input
                                        type="text"
                                        id="thumbnail"
                                        name="thumbnail"
                                        value={formData.thumbnail}
                                        onChange={handleInputChange}
                                        placeholder="URL da imagem de miniatura"
                                    />
                                </div>

                                <div className="admin-form-group checkbox-group">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="is_new"
                                            name="is_new"
                                            checked={formData.is_new}
                                            onChange={handleCheckboxChange}
                                        />
                                        <span className="checkbox-label">Marcar como novo</span>
                                    </label>
                                    <span className="form-help">
                                        Dashboards marcados como novos aparecem em destaque para os usuários
                                    </span>
                                </div>

                                <div className="admin-form-group">
                                    <label htmlFor="workspaces">Vincular a Workspaces</label>
                                    <select
                                        id="workspaces"
                                        name="workspaces"
                                        multiple
                                        value={formData.workspaces}
                                        onChange={handleWorkspaceChange}
                                        className="multi-select"
                                    >
                                        {workspaces.map(workspace => (
                                            <option key={workspace.id} value={workspace.id}>
                                                {workspace.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="form-help">
                                        Apenas usuários de empresas vinculadas a estes workspaces verão o dashboard
                                    </span>
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
                                Tem certeza que deseja excluir o dashboard <strong>{dashboardToDelete?.title}</strong>?
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
                                onClick={handleDeleteDashboard}
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