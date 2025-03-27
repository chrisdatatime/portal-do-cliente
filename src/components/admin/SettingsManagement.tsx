// src/components/admin/SettingsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import '@/styles/admin.css';

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    defaultLanguage: string;
    allowUserRegistration: boolean;
    maxUploadSize: number;
    sessionTimeout: number;
    enableNotifications: boolean;
}

export default function SettingsManagement() {
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: 'Portal do Cliente',
        siteDescription: 'Portal para clientes acessarem serviços e informações',
        maintenanceMode: false,
        defaultLanguage: 'pt-BR',
        allowUserRegistration: false,
        maxUploadSize: 10,
        sessionTimeout: 60,
        enableNotifications: true
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formChanged, setFormChanged] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);

            // Simular chamada de API para configurações
            // Em produção, substitua por uma chamada real à API
            setTimeout(() => {
                // Usando valores padrão para demonstração
                setLoading(false);
                setFormChanged(false);
            }, 1000);
        } catch (err: any) {
            setError('Erro ao carregar configurações: ' + (err.message || 'Falha na requisição'));
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setSettings(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }

        setFormChanged(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Simular salvar configurações
            // Em produção, substitua por uma chamada real à API
            setTimeout(() => {
                setSuccessMessage('Configurações salvas com sucesso!');
                setLoading(false);
                setFormChanged(false);

                // Limpar mensagem após alguns segundos
                setTimeout(() => setSuccessMessage(''), 3000);
            }, 800);
        } catch (err: any) {
            setError('Erro ao salvar configurações: ' + (err.message || 'Falha na operação'));
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Configurações do Sistema</h2>
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

            <form onSubmit={handleSubmit} className="admin-form settings-form">
                <div className="admin-form-section">
                    <h3 className="section-title">Informações Gerais</h3>

                    <div className="admin-form-group">
                        <label htmlFor="siteName">Nome do Portal</label>
                        <input
                            type="text"
                            id="siteName"
                            name="siteName"
                            value={settings.siteName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="siteDescription">Descrição</label>
                        <textarea
                            id="siteDescription"
                            name="siteDescription"
                            value={settings.siteDescription}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    <div className="admin-form-group checkbox-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                id="maintenanceMode"
                                name="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-label">Modo de Manutenção</span>
                        </label>
                        <small className="form-help">Ativar modo de manutenção bloqueará o acesso a usuários não administradores.</small>
                    </div>
                </div>

                <div className="admin-form-section">
                    <h3 className="section-title">Preferências de Usuário</h3>

                    <div className="admin-form-group">
                        <label htmlFor="defaultLanguage">Idioma Padrão</label>
                        <select
                            id="defaultLanguage"
                            name="defaultLanguage"
                            value={settings.defaultLanguage}
                            onChange={handleInputChange}
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es">Español</option>
                        </select>
                    </div>

                    <div className="admin-form-group checkbox-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                id="allowUserRegistration"
                                name="allowUserRegistration"
                                checked={settings.allowUserRegistration}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-label">Permitir cadastro de usuários</span>
                        </label>
                        <small className="form-help">Se desativado, apenas administradores poderão criar novos usuários.</small>
                    </div>

                    <div className="admin-form-group checkbox-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                id="enableNotifications"
                                name="enableNotifications"
                                checked={settings.enableNotifications}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-label">Ativar notificações</span>
                        </label>
                    </div>
                </div>

                <div className="admin-form-section">
                    <h3 className="section-title">Configurações Técnicas</h3>

                    <div className="admin-form-group">
                        <label htmlFor="maxUploadSize">Tamanho máximo de upload (MB)</label>
                        <input
                            type="number"
                            id="maxUploadSize"
                            name="maxUploadSize"
                            value={settings.maxUploadSize}
                            onChange={handleInputChange}
                            min="1"
                            max="100"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="sessionTimeout">Tempo de sessão (minutos)</label>
                        <input
                            type="number"
                            id="sessionTimeout"
                            name="sessionTimeout"
                            value={settings.sessionTimeout}
                            onChange={handleInputChange}
                            min="5"
                            max="1440"
                        />
                        <small className="form-help">Tempo de inatividade antes da sessão expirar (5-1440 minutos).</small>
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button
                        type="button"
                        className="admin-button secondary"
                        onClick={fetchSettings}
                        disabled={loading}
                    >
                        Restaurar Padrões
                    </button>
                    <button
                        type="submit"
                        className="admin-button primary"
                        disabled={loading || !formChanged}
                    >
                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>
            </form>
        </div>
    );
}