'use client';

import { useState } from 'react';
import { AlertCircle, Check, Calendar, Clock } from 'lucide-react';

interface FormData {
    title: string;
    serviceType: string;
    priority: string;
    description: string;
    scheduledDate: string;
    scheduledTime: string;
    attachments: File[];
}

export default function ServiceRequestForm() {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        serviceType: 'technical-support',
        priority: 'normal',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
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
        if (!formData.title.trim()) {
            setErrorMessage('Por favor, informe o título da solicitação.');
            return false;
        }
        if (!formData.description.trim()) {
            setErrorMessage('Por favor, descreva sua solicitação em detalhes.');
            return false;
        }
        if (formData.serviceType === 'scheduled' && (!formData.scheduledDate || !formData.scheduledTime)) {
            setErrorMessage('Para agendamentos, informe a data e hora desejadas.');
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

            // Adicionar os campos de texto ao formData
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'attachments') {
                    formDataToSend.append(key, value);
                }
            });

            // Adicionar os arquivos ao formData
            if (formData.attachments.length > 0) {
                formData.attachments.forEach((file) => {
                    formDataToSend.append('attachments', file);
                });
            }

            const response = await fetch('/api/service-requests', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao enviar a solicitação de serviço');
            }

            // Limpar o formulário após envio bem-sucedido
            setFormData({
                title: '',
                serviceType: 'technical-support',
                priority: 'normal',
                description: '',
                scheduledDate: '',
                scheduledTime: '',
                attachments: [],
            });

            setSubmitStatus('success');
        } catch (error) {
            console.error('Erro ao enviar solicitação:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="form-section">
            <h2>Nova Solicitação de Serviço</h2>

            {submitStatus === 'success' && (
                <div className="alert alert-success">
                    <Check size={20} />
                    <p>Solicitação enviada com sucesso! Nossa equipe analisará sua solicitação e entrará em contato em breve.</p>
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
                    <label htmlFor="title">Título da Solicitação *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ex: Configuração de novo usuário, Suporte para aplicativo, etc."
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="serviceType">Tipo de Serviço *</label>
                    <select
                        id="serviceType"
                        name="serviceType"
                        className="form-select"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                    >
                        <option value="technical-support">Suporte Técnico</option>
                        <option value="installation">Instalação</option>
                        <option value="maintenance">Manutenção</option>
                        <option value="scheduled">Agendamento</option>
                        <option value="training">Treinamento</option>
                        <option value="consultation">Consultoria</option>
                        <option value="other">Outro</option>
                    </select>
                </div>

                {formData.serviceType === 'scheduled' && (
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="scheduledDate">
                                <Calendar size={16} className="icon" /> Data Desejada *
                            </label>
                            <input
                                type="date"
                                id="scheduledDate"
                                name="scheduledDate"
                                className="form-control"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required={formData.serviceType === 'scheduled'}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="scheduledTime">
                                <Clock size={16} className="icon" /> Horário Preferencial *
                            </label>
                            <input
                                type="time"
                                id="scheduledTime"
                                name="scheduledTime"
                                className="form-control"
                                value={formData.scheduledTime}
                                onChange={handleChange}
                                required={formData.serviceType === 'scheduled'}
                            />
                        </div>
                    </div>
                )}

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
                        <option value="normal">Normal</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descrição da Solicitação *</label>
                    <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Descreva detalhadamente sua solicitação, incluindo informações relevantes como: sistema afetado, detalhes do problema, etapas para reproduzir, etc."
                        rows={5}
                        required
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
                    <small>Você pode anexar capturas de tela, documentos ou outros arquivos relevantes (máx. 5MB por arquivo)</small>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setFormData({
                                title: '',
                                serviceType: 'technical-support',
                                priority: 'normal',
                                description: '',
                                scheduledDate: '',
                                scheduledTime: '',
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
                        {submitting ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </div>
            </form>
        </div>
    );
} 