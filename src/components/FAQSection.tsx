'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export default function FAQSection() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);

    // Lista de perguntas frequentes simulada
    const faqList: FAQ[] = [
        {
            id: '1',
            question: 'Como solicitar um novo serviço na plataforma?',
            answer: 'Para solicitar um novo serviço, navegue até a aba "Nova Solicitação" na Central de Serviços. Preencha o formulário com as informações necessárias, incluindo título, tipo de serviço, descrição detalhada e, se necessário, anexe arquivos relevantes. Após o envio, você receberá uma confirmação e poderá acompanhar o status da sua solicitação na aba "Meus Tickets".',
            category: 'services',
        },
        {
            id: '2',
            question: 'Como acompanhar o status das minhas solicitações?',
            answer: 'Para acompanhar suas solicitações, acesse a aba "Meus Tickets" na Central de Serviços. Lá você encontrará uma lista de todas as suas solicitações com informações como status, data de criação e últimas atualizações. Clique em uma solicitação específica para ver mais detalhes e histórico de comunicações relacionadas a ela.',
            category: 'services',
        },
        {
            id: '3',
            question: 'O que fazer quando meu acesso à plataforma expira?',
            answer: 'Se seu acesso à plataforma expirou, você pode solicitar uma renovação através da página de login, clicando em "Problemas com acesso" e seguindo as instruções. Alternativamente, entre em contato com o administrador do sistema em sua empresa ou abra um chamado de suporte na Central de Serviços.',
            category: 'account',
        },
        {
            id: '4',
            question: 'Como alterar minha senha de acesso?',
            answer: 'Para alterar sua senha, clique no seu perfil no canto superior direito, selecione "Configurações" e em seguida "Alterar Senha". Você precisará informar sua senha atual e a nova senha. Recomendamos usar senhas fortes, com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.',
            category: 'account',
        },
        {
            id: '5',
            question: 'Quais são os horários de atendimento do suporte?',
            answer: 'Nossa equipe de suporte está disponível de segunda a sexta-feira, das 8h às 18h (fuso horário de Brasília). Solicitações enviadas fora desse horário serão atendidas no próximo dia útil. Para emergências fora do horário comercial, temos um canal de plantão que pode ser acessado através do botão "Suporte Emergencial" na tela de login.',
            category: 'support',
        },
        {
            id: '6',
            question: 'Como exportar relatórios da plataforma?',
            answer: 'Para exportar relatórios, acesse a seção "Relatórios" no menu principal. Selecione o tipo de relatório desejado, defina os filtros e período, e clique em "Gerar Relatório". Você poderá baixar o arquivo em diferentes formatos como PDF, Excel ou CSV, dependendo do tipo de relatório selecionado.',
            category: 'usage',
        },
        {
            id: '7',
            question: 'É possível acessar a plataforma pelo celular?',
            answer: 'Sim, nossa plataforma é responsiva e pode ser acessada através de navegadores em dispositivos móveis. Além disso, oferecemos aplicativos nativos para iOS e Android, que podem ser baixados nas respectivas lojas de aplicativos. Os aplicativos oferecem funcionalidades adicionais como notificações push e acesso offline a determinados dados.',
            category: 'access',
        },
        {
            id: '8',
            question: 'Como adicionar novos usuários à plataforma?',
            answer: 'A adição de novos usuários só pode ser realizada por administradores. Se você é um administrador, acesse "Administração" > "Usuários" > "Adicionar Usuário" e preencha as informações necessárias. Se você precisa de uma nova conta para um colega, entre em contato com o administrador da sua empresa ou abra um chamado de suporte solicitando a criação de um novo usuário.',
            category: 'admin',
        },
    ];

    // Filtrar FAQs com base na categoria e pesquisa
    const filteredFaqs = faqList.filter((faq) => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = searchQuery.trim() === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Manipular a abertura/fechamento de perguntas
    const toggleFaq = (id: string) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    return (
        <div className="faq-section">
            <h2>Perguntas Frequentes</h2>

            {/* Barra de pesquisa */}
            <div className="faq-search">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Pesquisar nas perguntas frequentes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Filtro por categorias */}
            <div className="faq-categories">
                <button
                    className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    Todas as Categorias
                </button>
                <button
                    className={`category-button ${activeCategory === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('services')}
                >
                    Serviços
                </button>
                <button
                    className={`category-button ${activeCategory === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('account')}
                >
                    Conta e Acesso
                </button>
                <button
                    className={`category-button ${activeCategory === 'support' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('support')}
                >
                    Suporte
                </button>
                <button
                    className={`category-button ${activeCategory === 'usage' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('usage')}
                >
                    Uso da Plataforma
                </button>
                <button
                    className={`category-button ${activeCategory === 'admin' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('admin')}
                >
                    Administração
                </button>
                <button
                    className={`category-button ${activeCategory === 'access' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('access')}
                >
                    Acessibilidade
                </button>
            </div>

            {/* Lista de perguntas */}
            <div className="faq-list">
                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => (
                        <div className="faq-item" key={faq.id}>
                            <div
                                className={`faq-question ${openFaqId === faq.id ? 'open' : ''}`}
                                onClick={() => toggleFaq(faq.id)}
                            >
                                <h3>{faq.question}</h3>
                                {openFaqId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            {openFaqId === faq.id && (
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Nenhuma pergunta encontrada para os critérios selecionados.</p>
                        <button
                            className="reset-search-btn"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('all');
                            }}
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Seção de contato */}
            <div className="faq-contact">
                <div className="contact-card">
                    <h3>Não encontrou o que procurava?</h3>
                    <p>Entre em contato com nossa equipe de suporte para obter ajuda personalizada.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/central-de-servicos?tab=new-support'}
                    >
                        Abrir um Chamado
                    </button>
                </div>
            </div>
        </div>
    );
} 