'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { simpleGetUser } from '@/lib/simple-auth';
import DashboardLayout from '@/components/DashboardLayout';



// Definição do tipo para relatórios do Power BI
interface PowerBIReport {
    id: string;
    name: string;
    embedUrl: string;
    type: 'report' | 'dashboard';
    thumbnail?: string;
    description?: string;
    createdAt: string;
    workspace: string;
}

const DashboardPage: React.FC = () => {
    const [reports, setReports] = useState<PowerBIReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);

                // Aqui faremos a chamada para a API para buscar os relatórios
                // Por enquanto, vamos usar dados de exemplo
                const response = await fetch('/api/powerbi/reports');

                if (!response.ok) {
                    throw new Error('Falha ao carregar os relatórios');
                }

                const data = await response.json();
                setReports(data);

            } catch (err: any) {
                console.error('Erro ao carregar relatórios:', err);
                setError(err.message || 'Ocorreu um erro ao carregar os relatórios');
            } finally {
                setIsLoading(false);
            }
        };

        // Para fins de demonstração, usando dados estáticos
        const mockReports: PowerBIReport[] = [
            {
                id: '1',
                name: 'Dashboard de Vendas',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=1',
                type: 'dashboard',
                thumbnail: '/images/reports/sales.jpg',
                description: 'Visão geral das vendas mensais e anuais',
                createdAt: '2025-03-15',
                workspace: 'Vendas'
            },
            {
                id: '2',
                name: 'Análise de Marketing',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=2',
                type: 'report',
                thumbnail: '/images/reports/marketing.jpg',
                description: 'Métricas de campanhas de marketing e ROI',
                createdAt: '2025-03-10',
                workspace: 'Marketing'
            },
            {
                id: '3',
                name: 'KPIs Financeiros',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=3',
                type: 'dashboard',
                thumbnail: '/images/reports/finance.jpg',
                description: 'Indicadores-chave de performance financeira',
                createdAt: '2025-03-05',
                workspace: 'Finanças'
            },
            {
                id: '4',
                name: 'Relatório de Operações',
                embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=4',
                type: 'report',
                thumbnail: '/images/reports/operations.jpg',
                description: 'Métricas operacionais e eficiência',
                createdAt: '2025-02-28',
                workspace: 'Operações'
            }
        ];

        // Simular chamada de API
        setTimeout(() => {
            setReports(mockReports);
            setIsLoading(false);
        }, 1000);

    }, []);

    // Filtrar relatórios com base na pesquisa
    const filteredReports = reports.filter(report =>
        report.name.toLowerCase().includes(filter.toLowerCase()) ||
        report.description?.toLowerCase().includes(filter.toLowerCase()) ||
        report.workspace.toLowerCase().includes(filter.toLowerCase())
    );

    // Filtrar relatórios com base na tab ativa
    const tabFilteredReports = activeTab === 'all'
        ? filteredReports
        : filteredReports.filter(report => report.type === activeTab);

    const openReport = (reportId: string) => {
        // Implementar navegação para o relatório
        console.log(`Abrindo relatório: ${reportId}`);
        // router.push(`/reports/${reportId}`);
    };

    return (
        <DashboardLayout>
            <div className="dashboard-container">
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

                <div className="dashboard-tabs">
                    <button
                        className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Todos
                    </button>
                    <button
                        className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboards
                    </button>
                    <button
                        className={`tab ${activeTab === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveTab('report')}
                    >
                        Relatórios
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Carregando dashboards...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Tentar novamente</button>
                    </div>
                ) : tabFilteredReports.length === 0 ? (
                    <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <h3>Nenhum dashboard encontrado</h3>
                        <p>Não encontramos dashboards correspondentes à sua busca.</p>
                    </div>
                ) : (
                    <div className="reports-grid">
                        {tabFilteredReports.map(report => (
                            <div
                                key={report.id}
                                className="report-card"
                                onClick={() => openReport(report.id)}
                            >
                                <div className="report-thumbnail">
                                    {report.thumbnail ? (
                                        <Image
                                            src={report.thumbnail}
                                            alt={report.name}
                                            width={300}
                                            height={180}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="placeholder-thumbnail">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                                <line x1="9" y1="21" x2="9" y2="9"></line>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="report-info">
                                    <h3>{report.name}</h3>
                                    <span className="report-type">{report.type === 'dashboard' ? 'Dashboard' : 'Relatório'}</span>
                                    <p className="report-description">{report.description}</p>
                                    <div className="report-footer">
                                        <span className="report-workspace">{report.workspace}</span>
                                        <span className="report-date">
                                            {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;