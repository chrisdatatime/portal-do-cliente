'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Home, FileText, LifeBuoy, HelpCircle, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Chatbot from '@/components/Chatbot';
import ServiceRequestForm from '@/components/ServiceRequestForm';
import SupportTicketList from '@/components/SupportTicketList';
import SupportTicketForm from '@/components/SupportTicketForm';
import FAQSection from '@/components/FAQSection';

// Importar estilos
import '@/styles/central-servicos.css';

export default function CentralServicos() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState('welcome');
    const [isChatbotVisible, setIsChatbotVisible] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Definir a aba ativa com base no parâmetro da URL
        if (tabParam) {
            setActiveTab(tabParam);
        }

        // Buscar dados do usuário para personalização
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const data = await response.json();
                    setUserName(data.name || 'Cliente');
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };

        fetchUserData();
    }, [tabParam]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'welcome':
                return (
                    <div className="welcome-banner">
                        <h1>Bem-vindo(a) à Central de Serviços, {userName}!</h1>
                        <p>Como podemos ajudar você hoje?</p>

                        <div className="service-cards">
                            <div className="service-card" onClick={() => setActiveTab('new-request')}>
                                <div className="icon-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3>Nova Solicitação</h3>
                                <p>Solicite serviços, reparos ou instalações</p>
                            </div>

                            <div className="service-card" onClick={() => setActiveTab('support')}>
                                <div className="icon-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <h3>Tickets de Suporte</h3>
                                <p>Veja o status dos seus chamados</p>
                            </div>

                            <div className="service-card" onClick={() => setActiveTab('new-support')}>
                                <div className="icon-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3>Abrir Chamado</h3>
                                <p>Entre em contato com nossa equipe de suporte</p>
                            </div>

                            <div className="service-card" onClick={() => setActiveTab('faq')}>
                                <div className="icon-container">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3>Perguntas Frequentes</h3>
                                <p>Encontre respostas para dúvidas comuns</p>
                            </div>
                        </div>

                        <div className="chatbot-suggestion">
                            <p>Não encontrou o que procura? Experimente nosso assistente virtual</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsChatbotVisible(true)}
                            >
                                Falar com assistente virtual
                            </button>
                        </div>
                    </div>
                );
            case 'new-request':
                return <ServiceRequestForm />;
            case 'support':
                return <SupportTicketList />;
            case 'new-support':
                return <SupportTicketForm />;
            case 'faq':
                return <FAQSection />;
            default:
                return <div>Conteúdo não encontrado</div>;
        }
    };

    return (
        <DashboardLayout>
            <div className="central-servicos">
                {activeTab !== 'welcome' && (
                    <div className="tabs-navigation">
                        <button
                            className={`tab-button ${activeTab === 'new-request' ? 'active' : ''}`}
                            onClick={() => setActiveTab('new-request')}
                        >
                            Nova Solicitação
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'support' ? 'active' : ''}`}
                            onClick={() => setActiveTab('support')}
                        >
                            Meus Tickets
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'new-support' ? 'active' : ''}`}
                            onClick={() => setActiveTab('new-support')}
                        >
                            Abrir Chamado
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
                            onClick={() => setActiveTab('faq')}
                        >
                            Perguntas Frequentes
                        </button>
                        <button
                            className="tab-button home-button"
                            onClick={() => setActiveTab('welcome')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="tab-content">
                    {renderTabContent()}
                </div>

                {isChatbotVisible && (
                    <Chatbot isOpen={isChatbotVisible} onClose={() => setIsChatbotVisible(false)} />
                )}

                {/* Botão flutuante para abrir o chatbot */}
                {!isChatbotVisible && (
                    <button
                        className="chatbot-toggle-button"
                        onClick={() => setIsChatbotVisible(true)}
                        aria-label="Abrir assistente virtual"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </button>
                )}
            </div>
        </DashboardLayout>
    );
}