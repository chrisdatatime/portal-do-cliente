'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, BarChart2, TrendingUp, Bookmark, Filter } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Definição de tipos
interface Dashboard {
  id: string;
  title: string;
  category: 'business' | 'marketing' | 'finance' | 'operations';
  type: 'Dashboard' | 'Relatório';
  description: string;
  lastUpdated: string;
  isFavorite: boolean;
  thumbnail?: string;
  isNew: boolean;
}

const EnhancedDashboard: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulando carregamento de dados
  useEffect(() => {
    // Aqui seria a chamada API real
    setTimeout(() => {
      setDashboards([
        {
          id: '1',
          title: 'Dashboard de Vendas',
          category: 'business',
          type: 'Dashboard',
          description: 'Visão geral das vendas mensais e anuais',
          lastUpdated: '14/03/2025',
          isFavorite: true,
          thumbnail: '/dashboard-vendas.jpg',
          isNew: false
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
          isNew: true
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
          isNew: false
        },
        {
          id: '4',
          title: 'Relatório de Operações',
          category: 'operations',
          type: 'Relatório',
          description: 'Métricas operacionais e eficiência',
          lastUpdated: '27/02/2025',
          isFavorite: false,
          thumbnail: '/relatorio-operacoes.jpg',
          isNew: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar dashboards
  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = dashboard.title.toLowerCase().includes(filter.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = activeCategory === 'all' || dashboard.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Separar dashboards em categorias
  const favorites = filteredDashboards.filter(d => d.isFavorite);
  const recent = [...filteredDashboards].sort((a, b) =>
    new Date(b.lastUpdated.split('/').reverse().join('-')).getTime() -
    new Date(a.lastUpdated.split('/').reverse().join('-')).getTime()
  ).slice(0, 4);
  const newItems = filteredDashboards.filter(d => d.isNew);

  return (
    <DashboardLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Cabeçalho com resumo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Olá, Christiándeluco</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                  <BarChart2 size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total de Dashboards</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{dashboards.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
                  <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Taxa de Uso</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">87%</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
                  <Clock size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Atualização</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">14/03</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 mr-4">
                  <Bookmark size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Favoritos</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{favorites.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar dashboards..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg ${activeCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}
                onClick={() => setActiveCategory('all')}
              >
                Todos
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${activeCategory === 'business' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}
                onClick={() => setActiveCategory('business')}
              >
                Negócios
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${activeCategory === 'marketing' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}
                onClick={() => setActiveCategory('marketing')}
              >
                Marketing
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${activeCategory === 'finance' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'}`}
                onClick={() => setActiveCategory('finance')}
              >
                Financeiro
              </button>
              <button
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Seção de novidades - destaque especial */}
        {newItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="inline-block bg-red-500 h-2 w-2 rounded-full mr-2"></span>
              Novidades
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newItems.map(dashboard => (
                <div key={dashboard.id} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg overflow-hidden shadow-md transform transition-transform hover:scale-102 relative">
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                    NOVO
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{dashboard.title}</h3>
                    <p className="mb-4 opacity-90">{dashboard.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-80">Atualizado: {dashboard.lastUpdated}</span>
                      <button className="bg-white text-blue-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100">
                        Ver agora
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção de favoritos */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Bookmark size={18} className="mr-2 text-amber-500" />
              Seus Favoritos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.map(dashboard => (
                <div key={dashboard.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    {dashboard.thumbnail ? (
                      <img src={dashboard.thumbnail} alt={dashboard.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart2 size={40} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <button className="absolute top-2 right-2 text-yellow-500">
                      <Bookmark size={18} fill="currentColor" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center">
                      <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {dashboard.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">{dashboard.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{dashboard.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {dashboard.lastUpdated}
                      </span>
                      <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todos os dashboards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Todos os Dashboards
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredDashboards.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Nenhum dashboard encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDashboards.map(dashboard => (
                <div key={dashboard.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 relative">
                    {dashboard.thumbnail ? (
                      <img src={dashboard.thumbnail} alt={dashboard.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart2 size={48} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-yellow-500">
                      <Bookmark size={18} fill={dashboard.isFavorite ? "currentColor" : "none"} />
                    </button>
                    {dashboard.isNew && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-md">
                        NOVO
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {dashboard.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dashboard.lastUpdated}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{dashboard.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{dashboard.description}</p>
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                        Visualizar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EnhancedDashboard;