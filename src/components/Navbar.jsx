'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { simpleGetUser, simpleLogout } from '@/lib/simple-auth';
import { User, LogOut, Settings, Bell, Search, X } from 'lucide-react';

const Navbar = () => {
    const [user, setUser] = useState({ name: '', email: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await simpleGetUser();
                console.log('Dados do usuário carregados:', userData);
                setUser(userData);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            }
        };

        fetchUserData();

        // Adicionar um event listener para fechar o menu quando clicar fora
        const handleClickOutside = (event) => {
            const profileMenu = document.getElementById('profile-menu');
            const profileButton = document.getElementById('profile-button');

            if (profileMenu && !profileMenu.contains(event.target) &&
                profileButton && !profileButton.contains(event.target)) {
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
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full h-16 z-[100]">
            <div className="max-w-full px-4 h-full mx-auto">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={120}
                                height={36}
                                className="h-9 w-auto"
                            />
                            <span className="ml-3 text-lg font-medium text-gray-800 dark:text-white hidden md:block">Portal do Cliente</span>
                        </Link>
                        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                            <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                Página Inicial
                            </Link>
                            <Link href="/reports" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                Relatórios
                            </Link>
                            <Link href="/connections" className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                                Conexões
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="relative mx-4 hidden md:block">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-2 bg-gray-50 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Pesquisar..."
                                    className="py-1 px-2 w-64 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
                                />
                                <Search size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            <Bell size={20} />
                        </button>

                        <div className="ml-3 relative">
                            <button
                                id="profile-button"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-expanded={isProfileOpen}
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>

                            {isProfileOpen && (
                                <div
                                    id="profile-menu"
                                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                                    style={{ zIndex: 9999 }}
                                >
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-start">
                                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl">
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">{user.name || 'Usuário'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'usuario@exemplo.com'}</p>
                                            <button className="text-xs text-blue-600 dark:text-blue-400 mt-1">Alterar o locatário</button>
                                        </div>
                                        <button
                                            onClick={() => setIsProfileOpen(false)}
                                            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="p-2">
                                        <div className="px-3 py-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de licença:</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">Pro</p>
                                        </div>
                                        <div className="px-3 py-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status da Avaliação:</p>
                                            <button className="text-xs text-blue-600 dark:text-blue-400">Cancelar a avaliação</button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                        <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                            <User size={16} className="mr-2" />
                                            Meu Perfil
                                        </a>
                                        <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                            <Settings size={16} className="mr-2" />
                                            Configurações
                                        </a>
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
        </nav>
    );
};

export default Navbar;