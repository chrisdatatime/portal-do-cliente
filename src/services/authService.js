// src/services/authService.js

import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Erro: Variáveis de ambiente do Supabase não definidas');
}

// Criar o cliente Supabase com opções otimizadas para persistência
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'portal-cliente-auth',
        autoRefreshToken: true,
        detectSessionInUrl: false,
    }
});

// Chaves para localStorage de backup
const AUTH_STORAGE_KEY = 'portal-auth-manual';
const USER_STORAGE_KEY = 'portal-user-data';

/**
 * Realiza login com email e senha
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} - Dados da sessão e usuário
 */
export const login = async (email, password) => {
    try {
        console.log('Iniciando login para:', email);

        // Limpar qualquer estado antigo
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        // Autenticar com Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Erro na autenticação Supabase:', error.message);
            throw error;
        }

        if (!data.session) {
            console.error('Login Supabase sem sessão');
            throw new Error('Não foi possível estabelecer sessão');
        }

        // Armazenar backup de autenticação
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');

        // Armazenar dados básicos do usuário
        if (data.user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                lastLogin: new Date().toISOString()
            }));
        }

        console.log('Login bem-sucedido:', data.user?.email);
        return data;
    } catch (error) {
        console.error('Erro no processo de login:', error);
        throw error;
    }
};

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<boolean>} - true se autenticado, false caso contrário
 */
export const isAuthenticated = async () => {
    try {
        // Primeiro verificar com Supabase
        const { data } = await supabase.auth.getSession();

        if (data.session) {
            console.log('Autenticado via sessão Supabase');
            return true;
        }

        // Verificar backup local
        if (localStorage.getItem(AUTH_STORAGE_KEY) === 'true') {
            console.log('Autenticado via localStorage (backup)');

            // Tentar refresh do token
            try {
                const { data: refreshData } = await supabase.auth.refreshSession();
                if (refreshData.session) {
                    console.log('Sessão restaurada após refresh');
                    return true;
                }
            } catch (refreshError) {
                console.warn('Falha ao tentar refresh do token:', refreshError);
            }

            // Se não conseguiu refresh mas tem o backup, ainda considera autenticado
            return true;
        }

        console.log('Usuário não autenticado');
        return false;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, verificar o backup
        return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    }
};

/**
 * Realiza logout
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        console.log('Iniciando logout');

        // Limpar dados locais primeiro
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        // Logout do Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro no logout Supabase:', error);
            throw error;
        }

        console.log('Logout concluído com sucesso');
    } catch (error) {
        console.error('Erro durante logout:', error);
        throw error;
    }
};

/**
 * Atualiza o token de acesso
 * @returns {Promise<Object>} - Dados da sessão atualizada
 */
export const refreshToken = async () => {
    try {
        console.log('Tentando atualizar token');

        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            console.error('Erro ao atualizar token:', error);
            throw error;
        }

        if (data.session) {
            console.log('Token atualizado com sucesso');
            return data;
        } else {
            console.warn('Refresh não gerou nova sessão');
            throw new Error('Não foi possível atualizar a sessão');
        }
    } catch (error) {
        console.error('Erro durante refresh token:', error);

        // Se falhar o refresh, limpar autenticação local
        localStorage.removeItem(AUTH_STORAGE_KEY);

        throw error;
    }
};

/**
 * Solicita redefinição de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} - Resultado da solicitação
 */
export const requestPasswordReset = async (email) => {
    try {
        console.log('Solicitando redefinição de senha para:', email);

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            console.error('Erro ao solicitar redefinição de senha:', error);
            throw error;
        }

        console.log('Solicitação de redefinição enviada com sucesso');
        return data;
    } catch (error) {
        console.error('Erro no processo de redefinição de senha:', error);
        throw error;
    }
};

/**
 * Atualiza a senha do usuário
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} - Resultado da atualização
 */
export const updatePassword = async (newPassword) => {
    try {
        console.log('Atualizando senha');

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Erro ao atualizar senha:', error);
            throw error;
        }

        console.log('Senha atualizada com sucesso');
        return data;
    } catch (error) {
        console.error('Erro no processo de atualização de senha:', error);
        throw error;
    }
};

/**
 * Obtém o usuário atual
 * @returns {Promise<Object|null>} - Dados do usuário ou null
 */
export const getCurrentUser = async () => {
    try {
        // Tentar obter do Supabase primeiro
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Erro ao obter usuário do Supabase:', error);
            // Tentar obter do backup local
            const localUser = localStorage.getItem(USER_STORAGE_KEY);
            return localUser ? JSON.parse(localUser) : null;
        }

        if (data.user) {
            return data.user;
        }

        // Se não encontrou no Supabase, tentar do backup local
        const localUser = localStorage.getItem(USER_STORAGE_KEY);
        return localUser ? JSON.parse(localUser) : null;
    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);

        // Em caso de erro, tentar do backup local
        const localUser = localStorage.getItem(USER_STORAGE_KEY);
        return localUser ? JSON.parse(localUser) : null;
    }
};

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {Object} metadata - Metadados adicionais
 * @returns {Promise<Object>} - Dados do usuário registrado
 */
export const register = async (email, password, metadata = {}) => {
    try {
        console.log('Registrando novo usuário:', email);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) {
            console.error('Erro no registro de usuário:', error);
            throw error;
        }

        console.log('Usuário registrado com sucesso');
        return data;
    } catch (error) {
        console.error('Erro no processo de registro:', error);
        throw error;
    }
};

/**
 * Funções de compatibilidade com código anterior
 */

// Obter token (para compatibilidade)
export const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
};

// Definir token (para compatibilidade)
export const setToken = () => {
    console.warn('setToken não é necessário ao usar Supabase Auth');
    return;
};

// Remover token (para compatibilidade)
export const removeToken = () => {
    console.warn('removeToken substituído por logout()');
    return logout();
};