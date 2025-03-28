// src/components/admin/CompanyManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import '@/styles/admin.css';

interface Company {
    id: string;
    name: string;
    logo?: string;
    created_at?: string;
    user_count?: number;
    description?: string;
}

export default function CompanyManagement() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        description: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/companies');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setCompanies(data);
            setError('');
            setLoading(false);
        } catch (err: any) {
            setError('Erro ao carregar empresas: ' + (err.message || 'Falha na requisição'));
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCompany = () => {
        setCurrentCompany(null);
        setFormData({
            name: '',
            logo: '',
            description: ''
        });
        setShowModal(true);
    };

    const handleEditCompany = (company: Company) => {
        setCurrentCompany(company);
        setFormData({
            name: company.name,
            logo: company.logo || '',
            description: company.description || ''
        });
        setShowModal(true);
    };

    const handleConfirmDelete = (company: Company) => {
        setCompanyToDelete(company);
        setShowDeleteConfirm(true);
    };

    const handleSaveCompany = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Nome da empresa é obrigatório');
            return;
        }

        try {
            setLoading(true);

            const method = currentCompany ? 'PUT' : 'POST';
            const url = currentCompany
                ? `/api/admin/companies/${currentCompany.id}`
                : '/api/admin/companies';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage(currentCompany ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!');
            setShowModal(false);
            await fetchCompanies();
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err: any) {
            setError('Erro ao salvar empresa: ' + (err.message || 'Falha na operação'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async () => {
        if (!companyToDelete) return;

        try {
            setLoading(true);

            const response = await fetch(`/api/admin/companies/${companyToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
            }

            setSuccessMessage('Empresa excluída com sucesso!');
            setShowDeleteConfirm(false);
            await fetchCompanies();
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (err: any) {
            setError('Erro ao excluir empresa: ' + (err.message || 'Falha na operação'));
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
                <h2>Gerenciamento de Empresas</h2>
                <div className="admin-header-actions">
                    <div className="search-bar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar empresas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className="admin-button primary"
                        onClick={handleAddCompany}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nova Empresa
                    </button>
                </div>
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

            {loading && companies.length === 0 ? (
                <div className="admin-loading">Carregando empresas...</div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Descrição</th>
                                <th>Criada em</th>
                                <th>Usuários</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="admin-no-data">
                                        Nenhuma empresa encontrada
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map(company => (
                                    <tr key={company.id}>
                                        <td>
                                            <div className="company-info">
                                                {company.logo && (
                                                    <div className="company-logo">
                                                        <Image
                                                            src={company.logo}
                                                            alt={company.name}
                                                            width={32}
                                                            height={32}
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                )}
                                                <span className="company-name">{company.name}</span>
                                            </div>
                                        </td>
                                        <td>{company.description || '-'}</td>
                                        <td>{formatDate(company.created_at)}</td>
                                        <td>{company.user_count || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="admin-button icon-button"
                                                    onClick={() => handleEditCompany(company)}
                                                    title="Editar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="admin-button icon-button danger"
                                                    onClick={() => handleConfirmDelete(company)}
                                                    title="Excluir"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
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

            {/* Modal para adicionar/editar empresa */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3>{currentCompany ? 'Editar Empresa' : 'Nova Empresa'}</h3>
                            <button
                                className="admin-button close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="admin-modal-content">
                            <form className="admin-form" onSubmit={handleSaveCompany}>
                                <div className="admin-form-group">
                                    <label htmlFor="name">Nome da Empresa *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nome da empresa"
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
                                        placeholder="Descreva a empresa"
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
                                        placeholder="/logos/empresa.svg"
                                    />
                                    <small className="form-help">URL relativa ou absoluta para a imagem de logo</small>
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
                                Tem certeza que deseja excluir a empresa <strong>{companyToDelete?.name}</strong>?
                            </p>
                            <p className="warning-text">Esta ação não pode ser desfeita e afetará todos os workspaces associados.</p>
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
                                onClick={handleDeleteCompany}
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