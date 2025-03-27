// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import '@/styles/dashboard.css';

// Definição de tipos
interface Dashboard {
  id: string;
  title: string;
  category: string;
  type: string;  // Este campo pode estar causando problemas - verifique se é uma string ou outro tipo
  description: string;
  lastUpdated: string;
  isFavorite: boolean;
  thumbnail?: string;
  isNew: boolean;
  embedUrl: string;
}

const Dashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Simulando carregamento de dados - seria substituído pela chamada API real
  useEffect(() => {
    const fetchDashboards = async () => {
      setIsLoading(true);
      try {
        // Em produção, substituir por fetch real para /api/powerbi/reports
        // const response = await fetch('/api/powerbi/reports');
        // if (!response.ok) throw new Error('Erro ao carregar dashboards');
        // const data = await response.json();

        // Dados simulados para desenvolvimento
        const mockData: Dashboard[] = [
          {
            id: "1",
            title: "Dashboard de Vendas",
            category: "business",
            type: "Dashboard", // Certifique-se de que este valor é do tipo esperado
            description: "Visão geral das vendas mensais e anuais",
            lastUpdated: "14/03/2025",
            isFavorite: true,
            thumbnail: "/dashboard-vendas.jpg",
            isNew: false,
            embedUrl: "https://app.powerbi.com/reportEmbed?reportId=f6bfd646-b718-44dc-a378-b73e6b528204"
          },
          {
            id: '2',
            title: 'Análise de Marketing',
            category: 'marketing',
            type: 'Relatório',
            description: 'Métricas de campanhas de marketing e ROI',
            lastUpdated: '09/03/2025',
            isFavorite: true,
            thumbnail: '/marketing-analytics.jpg',
            isNew: true,
            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=7cc1c1d5-5fb3-4bdb-bc7a-91c1e5453a34'
          },
          {
            id: '3',
            title: 'KPIs Financeiros',
            category: 'finance',
            type: 'Dashboard',
            description: 'Indicadores-chave de performance financeira',
            lastUpdated: '04/03/2025',
            isFavorite: false,
            thumbnail: '/kpis-financeiros.jpg',
            isNew: false,
            embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=89a2f5d7-8e3c-4c29-9db4-1d4a30e4e9f8'
          }
        ];

        setTimeout(() => {
          setDashboards(mockData);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Erro ao carregar dashboards:', error);
        setIsLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  // Efeito para fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Filtrar dashboards
  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = dashboard.title.toLowerCase().includes(filter.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dashboard.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Separar dashboards em categorias
  const favorites = filteredDashboards.filter(d => d.isFavorite);
  const newItems = filteredDashboards.filter(d => d.isNew);

  // Extrair categorias disponíveis
  const categories = [...new Set(dashboards.map(d => d.category))];

  // Função para lidar com click do dashboard
  const handleDashboardClick = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    setShowModal(true);
  };

  // Função para redirecionar para solicitação
  const handleRequestDashboard = () => {
    window.location.href = '/central-de-servicos';
  };

  // Função para adicionar/remover favoritos
  const toggleFavorite = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // Em produção, enviar para a API
    // const response = await fetch(`/api/powerbi/reports/${id}/favorite`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ favorite: !dashboards.find(d => d.id === id)?.isFavorite })
    // });

    // if (response.ok) {
    //   setDashboards(prev => prev.map(d => 
    //     d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
    //   ));
    // }

    // Simulação local
    setDashboards(prev => prev.map(d =>
      d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
    ));
  };

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        {/* Cabeçalho com resumo */}
        <div className="dashboard-header">
          <h1>Olá, Christiándeluco</h1>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar dashboards..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Buscar dashboards"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-title">Total de Dashboards</div>
              <div className="stat-value">{dashboards.length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-title">Taxa de Uso</div>
              <div className="stat-value">87%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-title">Última Atualização</div>
              <div className="stat-value">14/03</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-title">Favoritos</div>
              <div className="stat-value">{favorites.length}</div>
            </div>
          </div>
        </div>

        {/* Filtros de categoria */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'business' ? 'Negócios' :
                category === 'marketing' ? 'Marketing' :
                  category === 'finance' ? 'Financeiro' :
                    category === 'operations' ? 'Operações' :
                      category}
            </button>
          ))}
        </div>

        {/* Seção de Solicitar Dashboard */}
        <div className="dashboard-section">
          <div className="request-dashboard-card" onClick={handleRequestDashboard}>
            <div className="request-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <div className="request-content">
              <h3>Solicitar Novo Dashboard</h3>
              <p>Não encontrou o que procura? Solicite a criação de um novo dashboard personalizado.</p>
              <button className="request-button">Solicitar Agora</button>
            </div>
          </div>
        </div>

        {/* Seção de novidades */}
        {newItems.length > 0 && (
          <div className="dashboard-section">
            <h2 className="section-title">
              <span className="new-indicator"></span>
              Novidades
            </h2>

            <div className="featured-cards">
              {newItems.map(dashboard => (
                <div key={dashboard.id} className="featured-card" onClick={() => handleDashboardClick(dashboard)}>
                  <div className="new-badge">NOVO</div>
                  <h3>{dashboard.title}</h3>
                  <p>{dashboard.description}</p>
                  <div className="card-footer">
                    <span>Atualizado: {dashboard.lastUpdated}</span>
                    <button className="card-button" onClick={(e) => { e.stopPropagation(); handleDashboardClick(dashboard); }}>Ver agora</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de favoritos */}
        {favorites.length > 0 && (
          <div className="dashboard-section">
            <h2 className="section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Seus Favoritos
            </h2>

            <div className="reports-grid">
              {favorites.map(dashboard => (
                <div key={dashboard.id} className="report-card" onClick={() => handleDashboardClick(dashboard)}>
                  <div className="report-thumbnail">
                    {dashboard.thumbnail ? (
                      <img src={dashboard.thumbnail} alt={dashboard.title} />
                    ) : (
                      <div className="placeholder-thumbnail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                    )}
                    <button className="favorite-button" onClick={(e) => toggleFavorite(dashboard.id, e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="report-info">
                    <span className="report-type">{dashboard.type}</span>
                    <h3 className="report-title">{dashboard.title}</h3>
                    <p className="report-description">{dashboard.description}</p>
                    <div className="report-footer">
                      <span className="report-date">{dashboard.lastUpdated}</span>
                      <button className="report-action" onClick={(e) => { e.stopPropagation(); handleDashboardClick(dashboard); }}>Abrir</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os dashboards */}
        <div className="dashboard-section">
          <h2 className="section-title">Todos os Dashboards</h2>

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando dashboards...</p>
            </div>
          ) : filteredDashboards.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum dashboard encontrado</h3>
              <p>Não encontramos dashboards correspondentes à sua busca.</p>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredDashboards.map(dashboard => (
                <div key={dashboard.id} className="report-card" onClick={() => handleDashboardClick(dashboard)}>
                  <div className="report-thumbnail">
                    {dashboard.thumbnail ? (
                      <img src={dashboard.thumbnail} alt={dashboard.title} />
                    ) : (
                      <div className="placeholder-thumbnail">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                    )}
                    <button className={`favorite-button ${dashboard.isFavorite ? 'active' : ''}`} onClick={(e) => toggleFavorite(dashboard.id, e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={dashboard.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                    {dashboard.isNew && (
                      <div className="new-badge">NOVO</div>
                    )}
                  </div>
                  <div className="report-info">
                    <div className="report-header">
                      <span className="report-type">{dashboard.type}</span>
                      <span className="report-date">{dashboard.lastUpdated}</span>
                    </div>
                    <h3 className="report-title">{dashboard.title}</h3>
                    <p className="report-description">{dashboard.description}</p>
                    <div className="report-footer">
                      <button className="report-action-primary" onClick={(e) => { e.stopPropagation(); handleDashboardClick(dashboard); }}>Visualizar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Visualização do Power BI */}
        {showModal && selectedDashboard && (
          <div className="dashboard-modal-overlay">
            <div className="dashboard-modal" ref={modalRef}>
              <div className="dashboard-modal-header">
                <h3>{selectedDashboard.title}</h3>
                <button className="close-modal-button" onClick={() => setShowModal(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="dashboard-modal-content">
                <iframe
                  title={selectedDashboard.title}
                  src={selectedDashboard.embedUrl}
                  frameBorder="0"
                  allowFullScreen={true}
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;