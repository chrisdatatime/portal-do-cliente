// src/components/admin/WorkspacesManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/admin.css';

interface Workspace {
    id: string;
    name: string;
    description?: string;
    owner?: string;
    created_at?: string;
    report_count?: number;
}

export default function WorkspacesManagement() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        owner: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/workspaces');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setWorkspaces(data);
            setLoading(false);
        } catch (err: any) {
            setError('Erro ao carregar workspaces: ' + (err.message || 'Falha na requisição'));
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddWorkspace = () => {
        setCurrentWorkspace(null);
        setFormData({
            name: '',
            description: '',
            owner: ''
        });
        setShowModal(true);
    };

    const handleEditWorkspace = (workspace: Workspace) => {
        setCurrentWorkspace(workspace);
        setFormData({
            name: workspace.name,
            description: workspace.description || '',
            owner: workspace.owner || ''
        });
        setShowModal(true);
    };

    const handleConfirmDelete = (workspace: Workspace) => {
        setWorkspaceToDelete(workspace);
        setShowDeleteConfirm(true);
    };

    const handleSaveWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Nome do workspace é obrigatório');
            return;
        }

        try {
            setLoading(true);

            const method = currentWorkspace ? 'PUT' : 'POST';
            const url = currentWorkspace
                ? `/api/admin/workspaces/${currentWorkspace.id}`
                : '/api/admin/workspaces';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage(currentWorkspace ? 'Workspace atualizado com sucesso!' : 'Workspace criado com sucesso!');
            setShowModal(false);
            await fetchWorkspaces();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao salvar workspace: ' + (err.message || 'Falha na operação'));
            setLoading(false);
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!workspaceToDelete) return;

        try {
            setLoading(true);

            const response = await fetch(`/api/admin/workspaces/${workspaceToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Workspace excluído com sucesso!');
            setShowDeleteConfirm(false);
            await fetchWorkspaces();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao excluir workspace: ' + (err.message || 'Falha na operação'));
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
                <h2>Gerenciamento de Workspaces</h2>
                <button
                    className="admin-button primary"
                    onClick={handleAddWorkspace}
                >
                    Novo Workspace
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

            {loading && workspaces.length === 0 ? (
                <div className="admin-loading">Carregando workspaces...</div>
            ) : error ? (
                <div className="admin-error-display">
                    <p>Não foi possível carregar os workspaces:</p>
                    <p>{error}</p>
                    <button
                        className="admin-button primary"
                        onClick={fetchWorkspaces}
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Descrição</th>
                                <th>Proprietário</th>
                                <th>Data de Criação</th>
                                <th>Relatórios</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workspaces.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="admin-no-data">
                                        Nenhum workspace encontrado
                                    </td>
                                </tr>
                            ) : (
                                workspaces.map(workspace => (
                                    <tr key={workspace.id}>
                                        <td>{workspace.name}</td>
                                        <td>{workspace.description || '-'}</td>
                                        <td>{workspace.owner || '-'}</td>
                                        <td>{formatDate(workspace.created_at)}</td>
                                        <td>{workspace.report_count || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="admin-button icon-button"
                                                    onClick={() => handleEditWorkspace(workspace)}
                                                    title="Editar"
                                                >
                                                    <span className="material-icon">✏️</span>
                                                </button>
                                                <button
                                                    className="admin-button icon-button danger"
                                                    onClick={() => handleConfirmDelete(workspace)}
                                                    title="Excluir"
                                                >
                                                    <span className="material-icon">🗑️</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para adicionar/editar workspace */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{currentWorkspace ? 'Editar Workspace' : 'Novo Workspace'}</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSaveWorkspace} className="admin-form">
                            <div className="admin-form-group">
                                <label htmlFor="name">Nome *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Nome do workspace"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="description">Descrição</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Descreva o propósito deste workspace"
                                ></textarea>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="owner">Proprietário</label>
                                <input
                                    type="text"
                                    id="owner"
                                    name="owner"
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                    placeholder="Nome do responsável pelo workspace"
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
                                Tem certeza que deseja excluir o workspace <strong>{workspaceToDelete?.name}</strong>?
                            </p>
                            <p className="warning-text">Esta ação não pode ser desfeita e afetará todos os relatórios associados.</p>
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
                                onClick={handleDeleteWorkspace}
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