'use client';

import { useState, useEffect, useRef } from 'react';
import { Inbox, MessageSquare, Clock, CheckCircle, Send, ArrowLeft, User, Loader } from 'lucide-react';

interface Message {
    id: string;
    content: string;
    sentBy: 'user' | 'support';
    createdAt: string;
}

interface Ticket {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'open' | 'inProgress' | 'closed';
    createdAt: string;
    messages: Message[];
}

interface TicketDetailProps {
    ticketId: string;
    onBack: () => void;
}

export default function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/support-tickets/${ticketId}`);

                if (!response.ok) {
                    throw new Error('Falha ao carregar os detalhes do ticket');
                }

                const data = await response.json();
                setTicket(data.ticket);
                setError(null);
            } catch (error) {
                console.error('Erro ao buscar ticket:', error);
                setError('Não foi possível carregar os detalhes do ticket. Por favor, tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <Inbox className="status-icon open" />;
            case 'inProgress':
                return <Clock className="status-icon in-progress" />;
            case 'closed':
                return <CheckCircle className="status-icon closed" />;
            default:
                return <Inbox className="status-icon" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open':
                return 'Aberto';
            case 'inProgress':
                return 'Em andamento';
            case 'closed':
                return 'Concluído';
            default:
                return 'Desconhecido';
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !ticket) return;

        try {
            setSending(true);
            const response = await fetch(`/api/support-tickets/${ticketId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar mensagem');
            }

            const data = await response.json();

            // Adicionar a nova mensagem ao estado local
            setTicket({
                ...ticket,
                messages: [...ticket.messages, data.message],
            });

            setNewMessage('');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Não foi possível enviar sua mensagem. Por favor, tente novamente.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const updateTicketStatus = async (newStatus: string) => {
        if (!ticket) return;

        try {
            const response = await fetch(`/api/support-tickets/${ticketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar status do ticket');
            }

            setTicket({
                ...ticket,
                status: newStatus as 'open' | 'inProgress' | 'closed',
            });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Não foi possível atualizar o status do ticket. Por favor, tente novamente.');
        }
    };

    if (loading) {
        return (
            <div className="ticket-detail-loading">
                <Loader className="spin" size={24} />
                <p>Carregando detalhes do ticket...</p>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="ticket-detail-error">
                <p>{error || 'Ticket não encontrado'}</p>
                <button
                    className="btn btn-primary"
                    onClick={onBack}
                >
                    Voltar para a lista
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-detail-container">
            <div className="ticket-detail-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={16} />
                    <span>Voltar para tickets</span>
                </button>

                <div className="ticket-status-controls">
                    <span className="current-status">
                        {getStatusIcon(ticket.status)}
                        <span>{getStatusText(ticket.status)}</span>
                    </span>

                    {ticket.status !== 'closed' && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => updateTicketStatus('closed')}
                        >
                            Marcar como resolvido
                        </button>
                    )}

                    {ticket.status === 'closed' && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => updateTicketStatus('open')}
                        >
                            Reabrir ticket
                        </button>
                    )}
                </div>
            </div>

            <div className="ticket-detail-info">
                <h2>{ticket.title}</h2>
                <div className="ticket-meta">
                    <span className="ticket-category">{ticket.category}</span>
                    <span className="ticket-date">Criado em {formatDate(ticket.createdAt)}</span>
                </div>
                <p className="ticket-description">{ticket.description}</p>
            </div>

            <div className="ticket-messages-container">
                <h3>Mensagens</h3>

                <div className="messages-list">
                    {ticket.messages.length === 0 ? (
                        <p className="no-messages">
                            Nenhuma mensagem trocada ainda. Utilize o campo abaixo para iniciar a conversa.
                        </p>
                    ) : (
                        ticket.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sentBy === 'user' ? 'user-message' : 'support-message'}`}
                            >
                                <div className="message-avatar">
                                    {message.sentBy === 'user' ? (
                                        <User size={20} />
                                    ) : (
                                        <MessageSquare size={20} />
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-author">
                                            {message.sentBy === 'user' ? 'Você' : 'Suporte'}
                                        </span>
                                        <span className="message-time">
                                            {formatDate(message.createdAt)}
                                        </span>
                                    </div>
                                    <p>{message.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="message-input-container">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        disabled={ticket.status === 'closed' || sending}
                        rows={3}
                        className="message-input"
                    />
                    <button
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || ticket.status === 'closed' || sending}
                    >
                        {sending ? <Loader className="spin" size={16} /> : <Send size={16} />}
                    </button>
                </div>

                {ticket.status === 'closed' && (
                    <div className="ticket-closed-message">
                        <CheckCircle size={16} />
                        <p>Este ticket está marcado como resolvido. Reabra-o para enviar mais mensagens.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 