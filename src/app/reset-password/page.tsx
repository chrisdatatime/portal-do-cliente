'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/simple-auth';
import '@/styles/login.css';

export default function ResetPassword() {
    // Estados para controle de formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados para feedback visual
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para animações
    const [fadeIn, setFadeIn] = useState(false);
    const [shake, setShake] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Referências para elementos DOM
    const passwordRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Verificar se o dispositivo está em modo escuro
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Tentar obter email do URL ou localStorage
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Verificar se temos os parâmetros necessários do Supabase na URL
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');

        if (accessToken && refreshToken && type === 'recovery') {
            // Definir sessão no Supabase a partir dos parâmetros na URL
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }

        // Obter email do usuário que está redefinindo a senha
        const getUserEmail = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (data?.user?.email) {
                setEmail(data.user.email);
            } else {
                // Usar email do localStorage como fallback
                const storedEmail = localStorage.getItem('passwordResetRequested');
                if (storedEmail) setEmail(storedEmail);
            }
        };

        getUserEmail();

        // Detectar preferência de tema do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }

        // Ouvir mudanças no tema do sistema
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', handleChange);

        // Animar entrada da página
        setTimeout(() => setFadeIn(true), 100);

        // Focar automaticamente no campo de senha
        if (passwordRef.current) passwordRef.current.focus();

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validação de formulário
        if (!password) {
            setError('Por favor, informe sua nova senha');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Definindo nova senha...');

            // Atualizar senha no Supabase
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Feedback visual de sucesso
            setSuccess('Senha redefinida com sucesso!');
            setPassword('');
            setConfirmPassword('');

            // Limpar email armazenado localmente
            localStorage.removeItem('passwordResetRequested');

            // Redirecionar para login após alguns segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);

        } catch (err: any) {
            console.error('Falha ao redefinir senha:', err);

            // Feedback visual de erro
            setError(err.message || 'Não foi possível redefinir a senha. Tente novamente.');

            // Animação de shake no erro
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        window.location.href = '/login';
    };

    const handleFieldFocus = (field: string) => {
        setFocusedField(field);
    };

    const handleFieldBlur = () => {
        setFocusedField(null);
    };

    return (
        <div className={`login-page ${fadeIn ? 'fade-in' : ''} ${isDarkMode ? 'dark-mode' : ''}`}>
            <div className="login-background">
                <div className="login-shape shape-1"></div>
                <div className="login-shape shape-2"></div>
                <div className="login-shape shape-3"></div>
            </div>

            <div className="login-container">
                <div className={`login-form-wrapper ${shake ? 'shake' : ''}`}>
                    <div className="login-header">
                        <div className="logo-container">
                            <Image
                                src="/logo.svg"
                                alt="Binove Logo"
                                width={120}
                                height={40}
                                className="logo"
                                priority
                                style={{ width: 'auto', height: 'auto' }}
                            />
                        </div>
                        <h1 className="login-title">Criar Nova Senha</h1>
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    <form ref={formRef} className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="input-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>E-mail</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                disabled
                                className="form-control disabled"
                            />
                        </div>

                        <div className={`form-group ${focusedField === 'password' ? 'focused' : ''}`}>
                            <label htmlFor="password" className="input-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>Nova Senha</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type="password"
                                    id="password"
                                    ref={passwordRef}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Crie uma senha segura"
                                    className="form-control"
                                    autoComplete="new-password"
                                    onFocus={() => handleFieldFocus('password')}
                                    onBlur={handleFieldBlur}
                                />
                            </div>
                        </div>

                        <div className={`form-group ${focusedField === 'confirmPassword' ? 'focused' : ''}`}>
                            <label htmlFor="confirmPassword" className="input-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>Confirmar Senha</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirme sua nova senha"
                                    className="form-control"
                                    autoComplete="new-password"
                                    onFocus={() => handleFieldFocus('confirmPassword')}
                                    onBlur={handleFieldBlur}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="button-content">
                                    <span className="loader"></span>
                                    <span className="login-text">Processando...</span>
                                </div>
                            ) : (
                                <div className="button-content">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    <span className="login-text">Redefinir Senha</span>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="back-to-login">
                        <span onClick={handleGoToLogin}>
                            Voltar para o login
                        </span>
                    </div>

                    <div className="security-notice">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Conexão segura com criptografia de ponta a ponta</span>
                    </div>
                </div>

                <div className="login-footer">
                    <p>&copy; {new Date().getFullYear()} Binove • Todos os direitos reservados</p>
                </div>
            </div>
        </div>
    );
}