'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Componente para card individual
const DashboardCard = ({ title, type, description, category, date, imagePath }) => {
    return (
        <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 relative bg-gray-100 rounded-t-md overflow-hidden">
                {/* Imagem placeholder ou real */}
                {imagePath ? (
                    <Image
                        src={imagePath}
                        alt={title}
                        width={500}
                        height={300}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
                <div className="mb-2">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${type === 'Dashboard'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                        {type}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{category}</span>
                    <span>{date}</span>
                </div>
            </div>
        </div>
    );
};

const DashboardsPage = () => {
    const [activeTab, setActiveTab] = useState('todos');
    const [searchQuery, setSearchQuery] = useState('');

    // Dados de exemplo para os dashboards
    const dashboards = [
        {
            id: 1,
            title: 'Dashboard de Vendas',
            type: 'Dashboard',
            description: 'Visão geral das vendas mensais e anuais',
            category: 'Vendas',
            date: '14/03/2025',
            imagePath: '/placeholder-dashboard.png' // Substitua por seus caminhos reais de imagem
        },
        {
            id: 2,
            title: 'Análise de Marketing',
            type: 'Relatório',
            description: 'Métricas de campanhas de marketing e ROI',
            category: 'Marketing',
            date: '09/03/2025',
            imagePath: '/placeholder-dashboard.png'
        },
        {
            id: 3,
            title: 'KPIs Financeiros',
            type: 'Dashboard',
            description: 'Indicadores-chave de performance financeira',
            category: 'Finanças',
            date: '04/03/2025',
            imagePath: '/placeholder-dashboard.png'
        },
        {
            id: 4,
            title: 'Relatório de Operações',
            type: 'Relatório',
            description: 'Métricas operacionais e eficiência',
            category: 'Operações',
            date: '27/02/2025',
            imagePath: '/placeholder-dashboard.png'
        }
    ];

    // Filtrar dashboards com base na tab selecionada e texto de busca
    const filteredDashboards = dashboards.filter(dashboard => {
        const matchesSearch = dashboard.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'todos') return matchesSearch;
        if (activeTab === 'dashboards') return dashboard.type === 'Dashboard' && matchesSearch;
        if (activeTab === 'relatorios') return dashboard.type === 'Relatório' && matchesSearch;

        return matchesSearch;
    });

    return (
        <DashboardLayout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboards</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar dashboards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="absolute left-0 top-0 flex items-center pl-3 h-full">
                            <Search size={16} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Tabs de navegação */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('todos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'todos'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboards')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboards'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Dashboards
                        </button>
                        <button
                            onClick={() => setActiveTab('relatorios')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'relatorios'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Relatórios
                        </button>
                    </div>
                </div>

                {/* Grid de cards de dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDashboards.map((dashboard) => (
                        <DashboardCard
                            key={dashboard.id}
                            title={dashboard.title}
                            type={dashboard.type}
                            description={dashboard.description}
                            category={dashboard.category}
                            date={dashboard.date}
                            imagePath={dashboard.imagePath}
                        />
                    ))}
                </div>

                {/* Estado vazio */}
                {filteredDashboards.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                                <path d="M9 10.3c0 .5-.2.7-.7.7H6.7c-.5 0-.7-.2-.7-.7V8.7c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                                <path d="M9 15.3c0 .5-.2.7-.7.7H6.7c-.5 0-.7-.2-.7-.7v-1.6c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                                <path d="M14 10.3c0 .5-.2.7-.7.7h-1.6c-.5 0-.7-.2-.7-.7V8.7c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                                <path d="M14 15.3c0 .5-.2.7-.7.7h-1.6c-.5 0-.7-.2-.7-.7v-1.6c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                                <path d="M19 10.3c0 .5-.2.7-.7.7h-1.6c-.5 0-.7-.2-.7-.7V8.7c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                                <path d="M19 15.3c0 .5-.2.7-.7.7h-1.6c-.5 0-.7-.2-.7-.7v-1.6c0-.5.2-.7.7-.7h1.6c.5 0 .7.2.7.7v1.6z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum dashboard encontrado</h3>
                        <p className="text-gray-500">
                            Não foram encontrados dashboards que correspondam aos seus critérios de busca.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardsPage;