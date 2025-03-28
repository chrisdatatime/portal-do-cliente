'use client';

import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    subject: string;
    category: string;
    description: string;
    priority: string;
    attachments: File[];
}

export default function SupportTicketForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        category: 'technical',
        description: '',
        priority: 'medium',
        attachments: [],
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData((prev) => ({
                ...prev,
                attachments: Array.from(e.target.files || []),
            }));
        }
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setErrorMessage('Por favor, informe seu nome.');
            return false;
        }
        if (!formData.email.trim()) {
            setErrorMessage('Por favor, informe seu e-mail.');
            return false;
        }
        if (!formData.subject.trim()) {
            setErrorMessage('Por favor, informe o assunto do chamado.');
            return false;
        }
        if (!formData.description.trim()) {
            setErrorMessage('Por favor, descreva seu problema ou dúvida.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setSubmitStatus('error');
            return;
        }

        setSubmitting(true);
        setSubmitStatus('idle');

        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'attachments') {
                    formDataToSend.append(key, value);
                }
            });

            if (formData.attachments.length > 0) {
                formData.attachments.forEach((file) => {
                    formDataToSend.append('attachments', file);
                });
            }

            const response = await fetch('/api/support-tickets', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao enviar o chamado');
            }

            // Limpar o formulário após o envio bem-sucedido
            setFormData({
                name: '',
                email: '',
                subject: '',
                category: 'technical',
                description: '',
                priority: 'medium',
                attachments: [],
            });

            setSubmitStatus('success');
        } catch (error) {
            console.error('Erro ao enviar chamado:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao enviar seu chamado. Por favor, tente novamente.');
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="form-section">
            <h2>Abrir Novo Chamado de Suporte</h2>

            {submitStatus === 'success' && (
                <div className="alert alert-success">
                    <Check size={20} />
                    <p>Chamado enviado com sucesso! Nossa equipe de suporte entrará em contato em breve.</p>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <p>{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nome *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">E-mail *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Assunto *</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="form-control"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Categoria *</label>
                    <select
                        id="category"
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="technical">Problema Técnico</option>
                        <option value="billing">Faturamento</option>
                        <option value="account">Conta e Acesso</option>
                        <option value="feature">Sugestão de Funcionalidade</option>
                        <option value="question">Dúvida</option>
                        <option value="other">Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="priority">Prioridade</label>
                    <select
                        id="priority"
                        name="priority"
                        className="form-select"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição do Problema *</label>
                    <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        required
                        placeholder="Descreva seu problema detalhadamente, incluindo passos para reproduzir, mensagens de erro, etc."
                    ></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="attachments">Anexos (opcional)</label>
                    <input
                        type="file"
                        id="attachments"
                        name="attachments"
                        className="form-control"
                        onChange={handleFileChange}
                        multiple
                    />
                    <small>Você pode anexar capturas de tela ou documentos relevantes (máx. 5MB por arquivo)</small>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setFormData({
                                name: '',
                                email: '',
                                subject: '',
                                category: 'technical',
                                description: '',
                                priority: 'medium',
                                attachments: [],
                            });
                            setSubmitStatus('idle');
                        }}
                    >
                        Limpar
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Enviando...' : 'Enviar Chamado'}
                    </button>
                </div>
            </form>
        </div>
    );
} 