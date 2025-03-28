// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WorkspaceManager from '@/components/workspace/WorkspaceManager';
import { isStorageAvailable } from '@/lib/storage-utils';
import '@/styles/dashboard.css';

// Verificar se estamos no navegador
const isBrowser = typeof window !== 'undefined';

// Definição de tipos
interface Dashboard {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string;
  lastUpdated: string;
  isFavorite: boolean;
  thumbnail?: string;
  isNew: boolean;
  embedUrl: string;
}

interface UserRole {
  isOwner: boolean;
  isAdmin: boolean;
  workspaceId: string;
}

const Dashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Verificar papel do usuário
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user/role');
        if (!response.ok) throw new Error('Falha ao verificar papel do usuário');
        const data = await response.json();
        setUserRole(data);
      } catch (err) {
        console.error('Erro ao verificar papel do usuário:', err);
      }
    };

    checkUserRole();
  }, []);

  // Carregar dashboards da API
  useEffect(() => {
    const fetchDashboards = async () => {
      // Verificar se estamos no navegador e se o localStorage está disponível
      if (!isStorageAvailable()) return;

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/dashboards');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDashboards(data);
      } catch (error: any) {
        console.error('Erro ao carregar dashboards:', error);
        setError(error.message || 'Erro ao carregar dashboards');
      } finally {
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

    try {
      const currentFavoriteStatus = dashboards.find(d => d.id === id)?.isFavorite || false;

      // Atualizar localmente para feedback imediato
      setDashboards(prev => prev.map(d =>
        d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
      ));

      // Enviar para a API
      const response = await fetch('/api/dashboards/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_id: id,
          is_favorite: !currentFavoriteStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);

        // Reverter mudança local em caso de falha
        setDashboards(prev => prev.map(d =>
          d.id === id ? { ...d, isFavorite: currentFavoriteStatus } : d
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Mostrar um botão de solicitação se não houver dashboards
  if (!isLoading && dashboards.length === 0 && !error) {
    return (
      <DashboardLayout>
        <div className="dashboard-container">
          <div className="dashboard-empty-state">
            <h2>Nenhum dashboard disponível</h2>
            <p>Não há dashboards disponíveis para sua empresa no momento.</p>
            <button
              className="dashboard-request-button"
              onClick={handleRequestDashboard}
            >
              Solicitar Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {userRole?.isOwner ? (
        <WorkspaceManager workspaceId={userRole.workspaceId} />
      ) : (
        <div className="dashboard-container">
          {/* Cabeçalho com resumo */}
          <div className="dashboard-header">
            <h1>Dashboards</h1>

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

          {error && (
            <div className="dashboard-error">
              <p>{error}</p>
              <button
                className="dashboard-retry-button"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Carregando dashboards...</p>
            </div>
          ) : (
            <>
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
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-title">Favoritos</div>
                    <div className="stat-value">{favorites.length}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-title">Novos</div>
                    <div className="stat-value">{newItems.length}</div>
                  </div>
                </div>

                <div className="stat-card request-card" onClick={handleRequestDashboard}>
                  <div className="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-title">Solicitar</div>
                    <div className="stat-action">Dashboard</div>
                  </div>
                </div>
              </div>

              {/* Filtros de categoria */}
              {categories.length > 0 && (
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
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Seção de favoritos */}
              {favorites.length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">Favoritos</h2>
                  <div className="reports-grid">
                    {favorites.map(dashboard => (
                      <div key={dashboard.id} className="report-card" onClick={() => handleDashboardClick(dashboard)}>
                        <div className="report-header">
                          <div className="report-thumbnail" style={{ backgroundImage: dashboard.thumbnail ? `url(${dashboard.thumbnail})` : 'none' }}>
                            {!dashboard.thumbnail && <div className="thumbnail-placeholder">{dashboard.title.charAt(0)}</div>}
                            <button
                              className={`favorite-button ${dashboard.isFavorite ? 'active' : ''}`}
                              onClick={(e) => toggleFavorite(dashboard.id, e)}
                              aria-label={dashboard.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={dashboard.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="report-info">
                          <span className="report-type">{dashboard.type}</span>
                          <h3 className="report-title">{dashboard.title}</h3>
                          <p className="report-description">{dashboard.description}</p>
                          <div className="report-footer">
                            <span className="report-date">{formatDate(dashboard.lastUpdated)}</span>
                            <button className="report-action" onClick={(e) => { e.stopPropagation(); handleDashboardClick(dashboard); }}>Abrir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Novos dashboards */}
              {newItems.length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">Novidades</h2>
                  <div className="reports-grid">
                    {newItems.map(dashboard => (
                      <div key={dashboard.id} className="report-card new" onClick={() => handleDashboardClick(dashboard)}>
                        <div className="report-header">
                          <div className="report-thumbnail" style={{ backgroundImage: dashboard.thumbnail ? `url(${dashboard.thumbnail})` : 'none' }}>
                            {!dashboard.thumbnail && <div className="thumbnail-placeholder">{dashboard.title.charAt(0)}</div>}
                            <button
                              className={`favorite-button ${dashboard.isFavorite ? 'active' : ''}`}
                              onClick={(e) => toggleFavorite(dashboard.id, e)}
                              aria-label={dashboard.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={dashboard.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                            <div className="new-badge">Novo</div>
                          </div>
                        </div>
                        <div className="report-info">
                          <span className="report-type">{dashboard.type}</span>
                          <h3 className="report-title">{dashboard.title}</h3>
                          <p className="report-description">{dashboard.description}</p>
                          <div className="report-footer">
                            <span className="report-date">{formatDate(dashboard.lastUpdated)}</span>
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
                {filteredDashboards.length === 0 ? (
                  <div className="no-results">
                    <p>Nenhum dashboard encontrado para "{filter}"</p>
                    <button className="clear-filter" onClick={() => setFilter('')}>
                      Limpar filtro
                    </button>
                  </div>
                ) : (
                  <div className="reports-grid">
                    {filteredDashboards.map(dashboard => (
                      <div key={dashboard.id} className="report-card" onClick={() => handleDashboardClick(dashboard)}>
                        <div className="report-header">
                          <div className="report-thumbnail" style={{ backgroundImage: dashboard.thumbnail ? `url(${dashboard.thumbnail})` : 'none' }}>
                            {!dashboard.thumbnail && <div className="thumbnail-placeholder">{dashboard.title.charAt(0)}</div>}
                            <button
                              className={`favorite-button ${dashboard.isFavorite ? 'active' : ''}`}
                              onClick={(e) => toggleFavorite(dashboard.id, e)}
                              aria-label={dashboard.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={dashboard.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </button>
                            {dashboard.isNew && <div className="new-badge">Novo</div>}
                          </div>
                        </div>
                        <div className="report-info">
                          <span className="report-type">{dashboard.type}</span>
                          <h3 className="report-title">{dashboard.title}</h3>
                          <p className="report-description">{dashboard.description}</p>
                          <div className="report-footer">
                            <span className="report-date">{formatDate(dashboard.lastUpdated)}</span>
                            <button className="report-action" onClick={(e) => { e.stopPropagation(); handleDashboardClick(dashboard); }}>Abrir</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Modal de visualização de dashboard */}
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
      )}
    </DashboardLayout>
  );
};

export default Dashboard;