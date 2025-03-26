'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { simpleRequestPasswordReset, simpleIsAuthenticated } from '@/lib/simple-auth';
import '@/styles/login.css';

export default function RecuperarSenha() {
    // Estados para controle de formulário
    const [email, setEmail] = useState('');

    // Estados para feedback visual
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para animações
    const [fadeIn, setFadeIn] = useState(false);
    const [shake, setShake] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Referências para elementos DOM
    const emailRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Verificar se o dispositivo está em modo escuro
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Verificar se o usuário já está autenticado
        const checkAuth = async () => {
            const authenticated = await simpleIsAuthenticated();
            if (authenticated) {
                console.log('Usuário já autenticado, redirecionando para dashboard');
                window.location.href = '/dashboard';
                return;
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

        // Recuperar email salvo (se houver)
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validação de formulário
        if (!email) {
            setError('Por favor, informe seu e-mail');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        // Validação do formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, informe um e-mail válido');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Solicitando recuperação de senha para:', email);

            // Chamar função de recuperação de senha
            await simpleRequestPasswordReset(email);

            // Armazenar o email para a página de redefinição
            localStorage.setItem('passwordResetRequested', email);

            // Feedback visual de sucesso
            setSuccess(`Enviamos instruções para recuperação de senha para ${email}. Por favor, verifique sua caixa de entrada e pasta de spam.`);

            // Não limpar o email para permitir que o usuário veja para qual endereço foi enviado
            // setEmail('');

        } catch (err: any) {
            console.error('Falha na solicitação:', err);
            setError(err.message || 'Não foi possível processar sua solicitação. Tente novamente.');
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
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
                        <h1 className="login-title">Recuperação de Senha</h1>
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

                    <p className="recovery-instructions">
                        Informe seu e-mail cadastrado e enviaremos instruções para recuperar sua senha.
                    </p>

                    <form ref={formRef} className="login-form" onSubmit={handleSubmit}>
                        <div className={`form-group ${focusedField === 'email' ? 'focused' : ''}`}>
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
                                ref={emailRef}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu e-mail cadastrado"
                                className="form-control"
                                autoComplete="email"
                                onFocus={() => handleFieldFocus('email')}
                                onBlur={handleFieldBlur}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`login-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="button-content">
                                    <span className="loader"></span>
                                    <span className="login-text">Enviando...</span>
                                </div>
                            ) : (
                                <div className="button-content">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <span className="login-text">Recuperar Senha</span>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="back-to-login">
                        <span onClick={handleBackToLogin}>
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