'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { simpleLogin, simpleIsAuthenticated } from '@/lib/simple-auth';
import '@/styles/login.css';

// Tipo para o estado de campo focado
type FocusedField = 'email' | 'password' | null;

export default function Login() {
    // Estados para controle de formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Estados para feedback visual
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para animações
    const [fadeIn, setFadeIn] = useState(false);
    const [shake, setShake] = useState(false);
    const [focusedField, setFocusedField] = useState<FocusedField>(null);

    // Estado para toggle de visibilidade da senha
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Referências para elementos DOM
    const emailRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    // Verificar se o dispositivo está em modo escuro
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Verificar se o usuário já está autenticado
        const checkAuth = async () => {
            try {
                const isAuth = await simpleIsAuthenticated();
                if (isAuth) {
                    window.location.href = '/dashboard';
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            }
        };

        checkAuth();

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

        // Focar automaticamente no campo de email
        if (emailRef.current) emailRef.current.focus();

        // Recuperar credenciais salvas
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

        if (savedEmail && savedRememberMe) {
            setEmail(savedEmail);
            setRememberMe(true);
            // Auto-focus no campo de senha se o email já estiver preenchido
            setTimeout(() => {
                if (passwordInputRef.current) passwordInputRef.current.focus();
            }, 500);
        }

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validação básica
        if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            setShake(true);
            setTimeout(() => setShake(false), 600);

            // Anunciar para leitores de tela
            announceToScreenReader('Erro: Preencha todos os campos');

            return;
        }

        try {
            setIsLoading(true);
            console.log('Tentando autenticar usuário...');

            // Autenticar com Supabase via simpleLogin
            await simpleLogin(email, password);

            // Feedback visual de sucesso
            setSuccess('Login realizado com sucesso!');

            // Anunciar para leitores de tela
            announceToScreenReader('Login realizado com sucesso. Redirecionando para o painel.');

            // Gerenciar "lembrar-me"
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberMe');
            }

            // Efeito visual antes de redirecionar
            setTimeout(() => {
                console.log('Redirecionando para dashboard...');
                window.location.href = '/dashboard';
            }, 1000);

        } catch (err: any) {
            console.error('Falha na autenticação:', err);

            // Mensagem de erro amigável
            let errorMessage = 'Ocorreu um erro durante o login. Tente novamente.';

            if (err.message && err.message.includes('Invalid login credentials')) {
                errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
            } else if (err.code === 'USER_INACTIVE') {
                errorMessage = 'Sua conta está inativa. Entre em contato com o administrador.';
            }

            setError(errorMessage);

            // Anunciar para leitores de tela
            announceToScreenReader(`Erro de login: ${errorMessage}`);

            // Animação de shake no erro
            setShake(true);
            setTimeout(() => setShake(false), 600);

        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        window.location.href = '/recuperar-senha';
    };

    const handleFieldFocus = (field: FocusedField) => {
        setFocusedField(field);
    };

    const handleFieldBlur = () => {
        setFocusedField(null);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // Função para anunciar mensagens para leitores de tela
    const announceToScreenReader = (message: string) => {
        const announcement = document.getElementById('screen-reader-announcement');
        if (announcement) {
            announcement.textContent = message;
        }
    };

    return (
        <div
            className={`login-page ${fadeIn ? 'fade-in' : ''} ${isDarkMode ? 'dark-mode' : ''}`}
            role="main"
            aria-labelledby="login-title"
        >
            {/* Área reservada para anúncios de leitor de tela */}
            <div
                id="screen-reader-announcement"
                className="sr-only"
                aria-live="polite"
                aria-atomic="true"
            ></div>

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
                        <h1 className="login-title" id="login-title">Portal do Cliente</h1>
                    </div>

                    {error && (
                        <div className="error-message" role="alert" aria-live="assertive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                            <button
                                onClick={() => setError('')}
                                className="ml-auto"
                                aria-label="Fechar mensagem de erro"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="success-message" role="status" aria-live="polite">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    <form
                        ref={formRef}
                        className="login-form"
                        onSubmit={handleSubmit}
                        aria-label="Formulário de login"
                    >
                        <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
                            <label htmlFor="email" className="input-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>E-mail</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                ref={emailRef}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu e-mail corporativo"
                                className="form-control"
                                autoComplete="email"
                                onFocus={() => handleFieldFocus('email')}
                                onBlur={handleFieldBlur}
                                aria-required="true"
                                aria-invalid={error && !email ? "true" : "false"}
                            />
                        </div>

                        <div className={`form-group ${focusedField === 'password' ? 'focused' : ''}`}>
                            <label htmlFor="password" className="input-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <span>Senha</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    id="password"
                                    ref={passwordInputRef}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Sua senha"
                                    className="form-control"
                                    autoComplete="current-password"
                                    onFocus={() => handleFieldFocus('password')}
                                    onBlur={handleFieldBlur}
                                    aria-required="true"
                                    aria-invalid={error && !password ? "true" : "false"}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="password-toggle"
                                    aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={0}
                                >
                                    {passwordVisible ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-footer">
                            <div className="remember-me">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        id="remember-me"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        aria-label="Lembrar acesso"
                                    />
                                    <span className="checkmark" aria-hidden="true"></span>
                                    <span className="checkbox-label">Lembrar acesso</span>
                                </label>
                            </div>

                            <div className="forgot-password">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-button"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                            aria-disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="button-content">
                                    <span className="loader" aria-hidden="true"></span>
                                    <span className="login-text">Autenticando...</span>
                                </div>
                            ) : (
                                <div className="button-content">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                        <polyline points="10 17 15 12 10 7"></polyline>
                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                    </svg>
                                    <span className="login-text">Entrar</span>
                                </div>
                            )}
                        </button>
                    </form>

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