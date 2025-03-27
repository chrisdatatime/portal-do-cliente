// src/components/admin/UserManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { simpleIsAuthenticated } from '@/lib/simple-auth';
import '@/styles/admin.css';

interface UserData {
    id: string;
    email?: string;
    name?: string;
    company?: string;
    phone?: string;
    role?: string;
    created_at?: string;
    last_sign_in_at?: string;
    is_active?: boolean;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        company: '',
        phone: '',
        role: 'user',
        is_active: true
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setUsers(data || []);
            setError('');
        } catch (err: any) {
            setError('Erro ao carregar usuários: ' + (err.message || 'Falha na requisição'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddUser = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            company: '',
            phone: '',
            role: 'user',
            is_active: true
        });
        setModalMode('add');
        setShowModal(true);
    };

    const handleEditUser = (user: UserData) => {
        setCurrentUser(user);
        setFormData({
            email: user.email || '',
            password: '',
            name: user.name || '',
            company: user.company || '',
            phone: user.phone || '',
            role: user.role || 'user',
            is_active: user.is_active !== false
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleConfirmDelete = (user: UserData) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (modalMode === 'add') {
                if (!formData.password || formData.password.length < 6) {
                    setError('A senha deve ter pelo menos 6 caracteres');
                    return;
                }

                const response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
                }

                setSuccessMessage('Usuário criado com sucesso!');
            } else if (modalMode === 'edit' && currentUser) {
                const response = await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
                }

                setSuccessMessage('Usuário atualizado com sucesso!');
            }

            setShowModal(false);
            await fetchUsers();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao salvar usuário: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Usuário excluído com sucesso!');
            setShowDeleteConfirm(false);
            await fetchUsers();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError('Erro ao excluir usuário: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Gerenciamento de Usuários</h2>
                <button
                    className="admin-button primary"
                    onClick={handleAddUser}
                >
                    Adicionar Usuário
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

            {loading && users.length === 0 ? (
                <div className="admin-loading">Carregando usuários...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Empresa</th>
                                <th>Perfil</th>
                                <th>Criado em</th>
                                <th>Último acesso</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="admin-no-data">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.name || '-'}</td>
                                        <td>{user.email || '-'}</td>
                                        <td>{user.company || '-'}</td>
                                        <td>
                                            <span className={`role-badge ${user.role || 'user'}`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.created_at)}</td>
                                        <td>{formatDate(user.last_sign_in_at)}</td>
                                        <td>
                                            <span className={`status-badge ${user.is_active !== false ? 'active' : 'inactive'}`}>
                                                {user.is_active !== false ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="admin-button icon-button"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Editar"
                                                >
                                                    <span className="material-icon">✏️</span>
                                                </button>
                                                <button
                                                    className="admin-button icon-button danger"
                                                    onClick={() => handleConfirmDelete(user)}
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

            {/* Modal para adicionar/editar usuário */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{modalMode === 'add' ? 'Adicionar Usuário' : 'Editar Usuário'}</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="admin-form">
                            <div className="admin-form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {modalMode === 'add' && (
                                <div className="admin-form-group">
                                    <label htmlFor="password">Senha *</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={modalMode === 'add'}
                                        minLength={6}
                                    />
                                    {modalMode === 'add' && (
                                        <small className="form-hint">Mínimo de 6 caracteres</small>
                                    )}
                                </div>
                            )}

                            <div className="admin-form-group">
                                <label htmlFor="name">Nome</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="company">Empresa</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="phone">Telefone</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="role">Perfil</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {modalMode === 'edit' && (
                                <div className="admin-form-group checkbox">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                        />
                                        Usuário ativo
                                    </label>
                                </div>
                            )}

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
                                Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name || userToDelete?.email || 'selecionado'}</strong>?
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
                                onClick={handleDeleteUser}
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