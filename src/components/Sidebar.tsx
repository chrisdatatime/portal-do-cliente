'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { simpleGetUser, isAdmin } from '@/lib/simple-auth';
import LogoutButton from '@/components/LogoutButton';

interface MenuItem {
    title: string;
    path: string;
    icon: React.ReactNode;
    adminOnly: boolean;
}

const Sidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const pathname = usePathname();

    // Verificar se o usuário é administrador e obter informações do usuário
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const admin = await isAdmin();
                setUserIsAdmin(admin);

                // Obter dados do usuário
                const userData = await simpleGetUser();
                if (userData && userData.name) {
                    setUserName(userData.name);
                }
            } catch (error) {
                console.error('Erro ao verificar permissões de administrador:', error);
            }
        };

        checkAdmin();

        // Verificar preferência salva no localStorage para o estado da sidebar
        const savedSidebarState = localStorage.getItem('sidebarExpanded');
        if (savedSidebarState !== null) {
            setIsExpanded(savedSidebarState === 'true');
        }
    }, []);

    // Ícones para a sidebar
    const DashboardIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
    );

    const ConnectionsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
    );

    const ReportsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
    );

    const AdminIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );

    const ProfileIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );

    const SettingsIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    );

    // Definição dos itens de menu
    const menuItems: MenuItem[] = [
        {
            title: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardIcon />,
            adminOnly: false
        },
        {
            title: 'Conexões',
            path: '/connections',
            icon: <ConnectionsIcon />,
            adminOnly: false
        },
        {
            title: 'Relatórios',
            path: '/reports',
            icon: <ReportsIcon />,
            adminOnly: false
        },
        {
            title: 'Administração',
            path: '/admin',
            icon: <AdminIcon />,
            adminOnly: true
        },
        {
            title: 'Perfil',
            path: '/profile',
            icon: <ProfileIcon />,
            adminOnly: false
        },
        {
            title: 'Configurações',
            path: '/settings',
            icon: <SettingsIcon />,
            adminOnly: false
        }
    ];

    const toggleSidebar = () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        // Salvar preferência no localStorage
        localStorage.setItem('sidebarExpanded', String(newExpandedState));
    };

    return (
        <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={isExpanded ? 120 : 30}
                        height={30}
                        className="logo"
                    />
                </div>
                <button
                    className="toggle-button"
                    onClick={toggleSidebar}
                    aria-label={isExpanded ? "Recolher menu" : "Expandir menu"}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className="user-profile">
                    <div className="user-avatar">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{userName || 'Usuário'}</div>
                        <div className="user-role">{userIsAdmin ? 'Administrador' : 'Usuário'}</div>
                    </div>
                </div>
            )}

            <div className="menu-container">
                <nav className="main-nav">
                    <ul>
                        {menuItems.map((item, index) => {
                            // Não mostrar itens de administrador para usuários comuns
                            if (item.adminOnly && !userIsAdmin) {
                                return null;
                            }

                            const isActive = pathname === item.path;

                            return (
                                <li key={index} className={isActive ? 'active' : ''}>
                                    <Link href={item.path} className="menu-item">
                                        <span className="icon">{item.icon}</span>
                                        {isExpanded && <span className="title">{item.title}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {isExpanded && (
                <div className="sidebar-footer">
                    <div className="version">Portal do Cliente v2.0</div>
                    <div className="copyright">&copy; {new Date().getFullYear()} Binove</div>
                    <LogoutButton />
                </div>
            )}

            {/* Botão de logout compacto para sidebar recolhida */}
            {!isExpanded && (
                <div className="sidebar-footer-collapsed">
                    <LogoutButton showText={false} />
                </div>
            )}
        </div>
    );
};

export default Sidebar;