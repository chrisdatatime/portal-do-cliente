'use client';

import React, { useState, useEffect } from 'react';
import { Workspace, WorkspaceUser, WorkspaceStats, License } from '@/types/workspace';
import '@/styles/workspace.css';

interface WorkspaceManagerProps {
    workspaceId: string;
}

export default function WorkspaceManager({ workspaceId }: WorkspaceManagerProps) {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [stats, setStats] = useState<WorkspaceStats | null>(null);
    const [license, setLicense] = useState<License | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');

    // Carregar dados do workspace
    useEffect(() => {
        const fetchWorkspaceData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/workspaces/${workspaceId}`);
                if (!response.ok) throw new Error('Falha ao carregar dados do workspace');
                const data = await response.json();
                setWorkspace(data.workspace);
                setStats(data.stats);
                setLicense(data.license);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaceData();
    }, [workspaceId]);

    // Convidar usuário
    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Falha ao enviar convite');
            }

            // Atualizar lista de usuários
            const updatedWorkspace = await response.json();
            setWorkspace(updatedWorkspace);
            setInviteEmail('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Remover usuário
    const handleRemoveUser = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário?')) return;

        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/users/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Falha ao remover usuário');

            // Atualizar lista de usuários
            setWorkspace(prev => prev ? {
                ...prev,
                users: prev.users.filter(user => user.id !== userId)
            } : null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Alterar papel do usuário
    const handleChangeRole = async (userId: string, newRole: WorkspaceUser['role']) => {
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) throw new Error('Falha ao atualizar papel do usuário');

            // Atualizar lista de usuários
            const updatedWorkspace = await response.json();
            setWorkspace(updatedWorkspace);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!workspace || !stats || !license) return <div className="error">Dados não encontrados</div>;

    return (
        <div className="workspace-manager">
            {/* Cabeçalho com informações do workspace */}
            <div className="workspace-header">
                <h1>{workspace.name}</h1>
                <div className="workspace-stats">
                    <div className="stat">
                        <label>Usuários Ativos</label>
                        <span>{stats.activeUsers}/{license.maxUsers}</span>
                    </div>
                    <div className="stat">
                        <label>Convites Pendentes</label>
                        <span>{stats.pendingInvites}</span>
                    </div>
                    <div className="stat">
                        <label>Uso da Licença</label>
                        <span>{stats.licenseUsage}%</span>
                    </div>
                </div>
            </div>

            {/* Formulário de convite */}
            <div className="invite-section">
                <h2>Convidar Usuário</h2>
                <form onSubmit={handleInviteUser} className="invite-form">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Email do usuário"
                        required
                    />
                    <button
                        type="submit"
                        disabled={stats.activeUsers >= license.maxUsers}
                    >
                        Convidar
                    </button>
                </form>
                {stats.activeUsers >= license.maxUsers && (
                    <p className="warning">Limite de usuários atingido. Atualize sua licença para adicionar mais usuários.</p>
                )}
            </div>

            {/* Lista de usuários */}
            <div className="users-section">
                <h2>Usuários</h2>
                <div className="users-list">
                    {workspace.users.map(user => (
                        <div key={user.id} className="user-item">
                            <div className="user-info">
                                <strong>{user.name}</strong>
                                <span>{user.email}</span>
                                <span className={`status ${user.status}`}>{user.status}</span>
                            </div>
                            <div className="user-actions">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleChangeRole(user.id, e.target.value as WorkspaceUser['role'])}
                                    disabled={user.role === 'owner'}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="user">Usuário</option>
                                </select>
                                {user.role !== 'owner' && (
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="remove-button"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configurações do workspace */}
            <div className="settings-section">
                <h2>Configurações</h2>
                <div className="settings-list">
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={workspace.settings.allowUserInvite}
                                onChange={async (e) => {
                                    try {
                                        const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                allowUserInvite: e.target.checked
                                            })
                                        });
                                        if (!response.ok) throw new Error('Falha ao atualizar configuração');
                                        const updatedWorkspace = await response.json();
                                        setWorkspace(updatedWorkspace);
                                    } catch (err: any) {
                                        setError(err.message);
                                    }
                                }}
                            />
                            Permitir que administradores convidem usuários
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={workspace.settings.allowDashboardSharing}
                                onChange={async (e) => {
                                    try {
                                        const response = await fetch(`/api/workspaces/${workspaceId}/settings`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                allowDashboardSharing: e.target.checked
                                            })
                                        });
                                        if (!response.ok) throw new Error('Falha ao atualizar configuração');
                                        const updatedWorkspace = await response.json();
                                        setWorkspace(updatedWorkspace);
                                    } catch (err: any) {
                                        setError(err.message);
                                    }
                                }}
                            />
                            Permitir compartilhamento de dashboards
                        </label>
                    </div>
                </div>
            </div>

            {/* Informações da licença */}
            <div className="license-section">
                <h2>Licença</h2>
                <div className="license-info">
                    <div className="license-type">
                        <label>Tipo</label>
                        <span>{license.type}</span>
                    </div>
                    <div className="license-expiry">
                        <label>Expira em</label>
                        <span>{new Date(license.expiresAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="license-features">
                        <label>Recursos</label>
                        <ul>
                            {license.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 