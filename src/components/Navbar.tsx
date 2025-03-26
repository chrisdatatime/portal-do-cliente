'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { simpleGetUser, simpleLogout } from '@/lib/simple-auth';
import { User, LogOut, Settings, Bell, Search, X, Menu } from 'lucide-react';

interface User {
    name?: string;
    email?: string;
    avatarUrl?: string;
}

const Navbar: React.FC = () => {
    const [user, setUser] = useState<User>({ name: '', email: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await simpleGetUser();
                setUser(userData);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        };

        fetchUserData();

        // Adicionar um event listener para fechar o menu quando clicar fora
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await simpleLogout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    {/* Botão do menu para mobile */}
                    <button
                        className="navbar-menu-button md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Menu principal"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo e título */}
                    <Link href="/dashboard" className="navbar-logo">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={120}
                            height={36}
                            className="h-9 w-auto"
                        />
                        <span className="navbar-title">Portal do Cliente</span>
                    </Link>

                    {/* Links de navegação principal - visíveis apenas em desktop */}
                    <div className="navbar-links">
                        <Link href="/dashboard" className="navbar-link">
                            Dashboard
                        </Link>
                        <Link href="/reports" className="navbar-link">
                            Relatórios
                        </Link>
                        <Link href="/connections" className="navbar-link">
                            Conexões
                        </Link>
                    </div>
                </div>

                <div className="navbar-right">
                    {/* Busca - visível apenas em desktop */}
                    <div className="navbar-search">
                        <div className="search-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Pesquisar..."
                                className="search-input"
                            />
                            <Search size={18} className="search-icon" />
                        </div>
                    </div>

                    {/* Notificações */}
                    <button className="navbar-icon-button" aria-label="Notificações">
                        <Bell size={20} />
                    </button>

                    {/* Perfil do usuário */}
                    <div className="navbar-profile">
                        <button
                            ref={profileButtonRef}
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="navbar-profile-button"
                            aria-expanded={isProfileOpen}
                        >
                            <div className="navbar-avatar">
                                {user.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        alt={user.name || 'Avatar'}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div
                                ref={profileMenuRef}
                                className="profile-menu"
                            >
                                <div className="profile-menu-header">
                                    <div className="profile-menu-avatar">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="profile-menu-info">
                                        <p className="profile-menu-name">{user.name || 'Usuário'}</p>
                                        <p className="profile-menu-email">{user.email || 'usuario@exemplo.com'}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsProfileOpen(false)}
                                        className="profile-menu-close"
                                        aria-label="Fechar menu"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="profile-menu-links">
                                    <Link href="/profile" className="profile-menu-link">
                                        <User size={16} className="profile-menu-icon" />
                                        Meu Perfil
                                    </Link>
                                    <Link href="/settings" className="profile-menu-link">
                                        <Settings size={16} className="profile-menu-icon" />
                                        Configurações
                                    </Link>
                                </div>

                                <div className="profile-menu-footer">
                                    <button
                                        onClick={handleLogout}
                                        className="profile-menu-logout"
                                    >
                                        <LogOut size={16} className="profile-menu-icon" />
                                        Sair
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu mobile - visível apenas quando aberto em dispositivos móveis */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-search">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar..."
                            className="mobile-search-input"
                        />
                        <Search size={18} className="mobile-search-icon" />
                    </div>
                    <div className="mobile-links">
                        <Link href="/dashboard" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link href="/reports" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Relatórios
                        </Link>
                        <Link href="/connections" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Conexões
                        </Link>
                        <Link href="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Meu Perfil
                        </Link>
                        <Link href="/settings" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                            Configurações
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="mobile-logout"
                        >
                            <LogOut size={16} className="mobile-logout-icon" />
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;