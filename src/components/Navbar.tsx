'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { simpleGetUser, simpleLogout } from '@/lib/simple-auth';
import { User, LogOut, Settings, Bell, Search, X, Menu, Gift, Star, HelpCircle, BarChart2, Sun, Moon } from 'lucide-react';

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
    const [notifications, setNotifications] = useState(3);
    const [promoActive, setPromoActive] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        // Detectar preferência de tema do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark-mode');
        }

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

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark-mode');
    };

    const handleLogout = async () => {
        try {
            await simpleLogout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const dismissPromo = () => {
        setPromoActive(false);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full h-16 z-50 shadow-sm">
            <div className="max-w-full px-4 h-full mx-auto">
                <div className="flex justify-between items-center h-full">
                    {/* Lado esquerdo */}
                    <div className="flex items-center">
                        {/* Botão do menu para mobile */}
                        <button
                            className="mr-2 p-2 text-gray-600 dark:text-gray-300 rounded-md md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu principal"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Logo e título */}
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={120}
                                height={36}
                                className="h-8 w-auto"
                            />
                            <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white hidden md:block">
                                Portal do Cliente
                            </span>
                        </Link>

                        {/* Links de navegação principal - visíveis apenas em desktop */}
                        <div className="hidden md:flex ml-6 space-x-4">
                            <Link
                                href="/dashboard"
                                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/reports"
                                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Relatórios
                            </Link>
                            <Link
                                href="/connections"
                                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                                Conexões
                            </Link>
                        </div>
                    </div>

                    {/* Seção central com novidades e promoções */}
                    <div className="hidden lg:flex items-center justify-center flex-grow mx-4">
                        {promoActive && (
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full flex items-center animate-pulse relative">
                                <Gift size={16} className="mr-2" />
                                <span className="text-sm font-medium">Novo! Acesso liberado aos dashboards Premium até 15/04</span>
                                <button
                                    className="ml-3 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold"
                                >
                                    Ver agora
                                </button>
                                <button
                                    onClick={dismissPromo}
                                    className="ml-2 text-white/80 hover:text-white"
                                    aria-label="Fechar promoção"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Lado direito */}
                    <div className="flex items-center space-x-2">
                        {/* Botão tema claro/escuro */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full"
                            aria-label={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Ajuda */}
                        <button className="hidden sm:flex p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full">
                            <HelpCircle size={20} />
                        </button>

                        {/* Favoritos */}
                        <button className="hidden sm:flex p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full">
                            <Star size={20} />
                        </button>

                        {/* Insights - apenas em telas maiores */}
                        <button className="hidden lg:flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                            <BarChart2 size={16} className="mr-1.5" />
                            <span>Insights</span>
                        </button>

                        {/* Busca - visível apenas em desktop */}
                        <div className="hidden md:block relative mx-2">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-2 bg-gray-50 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Pesquisar..."
                                    className="py-1 px-2 w-48 xl:w-64 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                                />
                                <Search size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        {/* Notificações */}
                        <button className="relative p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full">
                            <Bell size={20} />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {notifications}
                                </span>
                            )}
                        </button>

                        {/* Perfil do usuário */}
                        <div className="relative ml-1">
                            <button
                                ref={profileButtonRef}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center justify-center rounded-full w-8 h-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-expanded={isProfileOpen}
                            >
                                {user.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        alt={user.name || 'Avatar'}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </button>

                            {isProfileOpen && (
                                <div
                                    ref={profileMenuRef}
                                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100]"
                                >
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start">
                                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name || 'Usuário'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'usuario@exemplo.com'}</p>
                                            <button className="text-xs text-blue-600 dark:text-blue-400 mt-1">Gerenciar conta</button>
                                        </div>
                                        <button
                                            onClick={() => setIsProfileOpen(false)}
                                            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
                                        >
                                            <User size={16} className="mr-2" />
                                            Meu Perfil
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
                                        >
                                            <Settings size={16} className="mr-2" />
                                            Configurações
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu mobile - visível apenas quando aberto em dispositivos móveis */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 md:hidden">
                    <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={100}
                                    height={30}
                                    className="h-8 w-auto"
                                />
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-3">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name || 'Usuário'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'usuario@exemplo.com'}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Pesquisar..."
                                    className="bg-gray-50 dark:bg-gray-700 w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                />
                            </div>
                        </div>

                        <div className="px-2 py-2">
                            <Link
                                href="/dashboard"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/reports"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Relatórios
                            </Link>
                            <Link
                                href="/connections"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Conexões
                            </Link>
                            <Link
                                href="/profile"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Meu Perfil
                            </Link>
                            <Link
                                href="/settings"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Configurações
                            </Link>
                        </div>

                        {/* Promoção em dispositivos móveis */}
                        {promoActive && (
                            <div className="mx-4 my-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-md">
                                <div className="flex items-center mb-1">
                                    <Gift size={16} className="mr-2" />
                                    <span className="text-sm font-medium">Acesso Premium</span>
                                    <button
                                        onClick={dismissPromo}
                                        className="ml-auto text-white/80 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <p className="text-xs mb-2">Acesso liberado aos dashboards Premium até 15/04</p>
                                <button className="w-full bg-white text-blue-600 py-1 rounded-md text-xs font-bold">
                                    Ver agora
                                </button>
                            </div>
                        )}

                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 mt-auto">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                            >
                                <LogOut size={18} className="mr-2" />
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;