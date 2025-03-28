'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface Ticket {
    id: string;
    title: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: string;
    createdAt: string;
    updatedAt: string;
    description: string;
}

export default function SupportTicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/support-tickets');

                if (!response.ok) {
                    throw new Error('Erro ao carregar tickets');
                }

                const data = await response.json();
                setTickets(data.tickets);
                setFilteredTickets(data.tickets);
            } catch (error) {
                console.error('Erro ao buscar tickets:', error);
                setError('Não foi possível carregar seus tickets. Por favor, tente novamente mais tarde.');

                // Dados simulados para fins de demonstração
                const mockTickets: Ticket[] = [
                    {
                        id: 'TK-1001',
                        title: 'Problema com acesso ao sistema',
                        status: 'open',
                        priority: 'high',
                        category: 'technical',
                        createdAt: '2023-03-25T10:30:00Z',
                        updatedAt: '2023-03-25T10:30:00Z',
                        description: 'Não consigo acessar o sistema após a atualização de ontem. A tela fica carregando indefinidamente.'
                    },
                    {
                        id: 'TK-982',
                        title: 'Solicitação de novo usuário',
                        status: 'in-progress',
                        priority: 'normal',
                        category: 'account',
                        createdAt: '2023-03-20T14:15:00Z',
                        updatedAt: '2023-03-21T09:45:00Z',
                        description: 'Precisamos adicionar um novo usuário para o departamento de marketing.'
                    },
                    {
                        id: 'TK-943',
                        title: 'Erro ao gerar relatório mensal',
                        status: 'resolved',
                        priority: 'high',
                        category: 'technical',
                        createdAt: '2023-03-15T11:20:00Z',
                        updatedAt: '2023-03-17T16:30:00Z',
                        description: 'Ao tentar gerar o relatório mensal de vendas, o sistema apresenta um erro de timeout.'
                    },
                    {
                        id: 'TK-927',
                        title: 'Dúvida sobre renovação de licença',
                        status: 'closed',
                        priority: 'low',
                        category: 'billing',
                        createdAt: '2023-03-10T09:00:00Z',
                        updatedAt: '2023-03-11T14:20:00Z',
                        description: 'Gostaria de saber como proceder para renovar a licença que vence no próximo mês.'
                    },
                    {
                        id: 'TK-902',
                        title: 'Solicitação de treinamento',
                        status: 'in-progress',
                        priority: 'normal',
                        category: 'training',
                        createdAt: '2023-03-05T13:40:00Z',
                        updatedAt: '2023-03-06T10:15:00Z',
                        description: 'Precisamos agendar um treinamento para novos funcionários sobre o módulo de gestão de projetos.'
                    }
                ];

                setTickets(mockTickets);
                setFilteredTickets(mockTickets);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Função para filtrar tickets por status
    useEffect(() => {
        let result = [...tickets];

        // Filtrar por status
        if (activeFilter !== 'all') {
            result = result.filter(ticket => ticket.status === activeFilter);
        }

        // Filtrar por pesquisa
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                ticket =>
                    ticket.title.toLowerCase().includes(query) ||
                    ticket.id.toLowerCase().includes(query) ||
                    ticket.description.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(result);
    }, [activeFilter, searchQuery, tickets]);

    // Formatar data para exibição
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

    // Obter status traduzido e ícone
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'open':
                return {
                    label: 'Aberto',
                    icon: <AlertCircle size={16} className="status-icon" />,
                    className: 'status-open'
                };
            case 'in-progress':
                return {
                    label: 'Em Andamento',
                    icon: <Clock size={16} className="status-icon" />,
                    className: 'status-progress'
                };
            case 'resolved':
                return {
                    label: 'Resolvido',
                    icon: <CheckCircle size={16} className="status-icon" />,
                    className: 'status-resolved'
                };
            case 'closed':
                return {
                    label: 'Fechado',
                    icon: <CheckCircle size={16} className="status-icon" />,
                    className: 'status-closed'
                };
            default:
                return {
                    label: 'Desconhecido',
                    icon: <AlertCircle size={16} className="status-icon" />,
                    className: 'status-unknown'
                };
        }
    };

    // Obter prioridade traduzida
    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return 'Baixa';
            case 'normal': return 'Normal';
            case 'high': return 'Alta';
            case 'urgent': return 'Urgente';
            default: return 'Desconhecida';
        }
    };

    // Obter categoria traduzida
    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'technical': return 'Suporte Técnico';
            case 'account': return 'Conta e Acesso';
            case 'billing': return 'Faturamento';
            case 'training': return 'Treinamento';
            default: return category.charAt(0).toUpperCase() + category.slice(1);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loader2 size={40} className="loading-spinner" />
                <p>Carregando seus tickets...</p>
            </div>
        );
    }

    return (
        <div className="ticket-list-container">
            <h2>Meus Tickets de Suporte</h2>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="ticket-filters">
                <div className="search-filter">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Pesquisar tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-wrapper">
                        <Filter size={18} className="filter-icon" />
                        <select
                            className="filter-select"
                            value={activeFilter}
                            onChange={(e) => setActiveFilter(e.target.value)}
                        >
                            <option value="all">Todos os status</option>
                            <option value="open">Abertos</option>
                            <option value="in-progress">Em andamento</option>
                            <option value="resolved">Resolvidos</option>
                            <option value="closed">Fechados</option>
                        </select>
                    </div>
                </div>

                <button
                    className="btn btn-primary new-ticket-btn"
                    onClick={() => window.location.href = '/central-de-servicos?tab=new-support'}
                >
                    Abrir Novo Ticket
                </button>
            </div>

            {filteredTickets.length > 0 ? (
                <div className="ticket-grid">
                    {filteredTickets.map((ticket) => {
                        const statusInfo = getStatusInfo(ticket.status);

                        return (
                            <div className="ticket-card" key={ticket.id}>
                                <div className="ticket-header">
                                    <div className="ticket-id">{ticket.id}</div>
                                    <div className={`ticket-status ${statusInfo.className}`}>
                                        {statusInfo.icon}
                                        <span>{statusInfo.label}</span>
                                    </div>
                                </div>

                                <h3 className="ticket-title">{ticket.title}</h3>

                                <p className="ticket-description">
                                    {ticket.description.length > 100
                                        ? `${ticket.description.substring(0, 100)}...`
                                        : ticket.description}
                                </p>

                                <div className="ticket-meta">
                                    <div className="meta-item">
                                        <span className="meta-label">Categoria:</span>
                                        <span className="meta-value">{getCategoryLabel(ticket.category)}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-label">Prioridade:</span>
                                        <span className="meta-value">{getPriorityLabel(ticket.priority)}</span>
                                    </div>
                                </div>

                                <div className="ticket-footer">
                                    <div className="ticket-date">
                                        Aberto em: {formatDate(ticket.createdAt)}
                                    </div>
                                    <button className="ticket-details-btn">
                                        Ver Detalhes <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-tickets">
                    <div className="empty-icon">
                        <AlertCircle size={48} />
                    </div>
                    <h3>Nenhum ticket encontrado</h3>
                    <p>
                        {searchQuery || activeFilter !== 'all'
                            ? 'Não encontramos tickets que correspondam aos filtros aplicados.'
                            : 'Você ainda não possui tickets de suporte abertos.'}
                    </p>
                    {(searchQuery || activeFilter !== 'all') && (
                        <button
                            className="reset-filters-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveFilter('all');
                            }}
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}