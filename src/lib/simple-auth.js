// src/lib/simple-auth.js

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'portal-cliente-auth'
    }
});

// Login com verificação real do Supabase
export const simpleLogin = async (email, password) => {
    console.log('Autenticando no Supabase:', email);

    // Autenticar com o Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Erro na autenticação:', error.message);
        throw error;
    }

    if (!data.session) {
        console.error('Sessão não criada após login');
        throw new Error('Não foi possível criar sessão');
    }

    // Armazenar backup no localStorage para facilitar redirecionamentos
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);

    return data;
};

// Verificação de autenticação que combina Supabase e localStorage
export const simpleIsAuthenticated = async () => {
    try {
        // Verificar com Supabase
        const { data } = await supabase.auth.getSession();

        if (data.session) {
            // Verificar se o usuário está ativo
            const user = data.session.user;

            if (user?.app_metadata?.disabled === true) {
                console.log('Usuário autenticado, mas desativado');
                await supabase.auth.signOut();
                return false;
            }

            // Verificar também na tabela profiles
            const { data: profileData } = await supabase
                .from('profiles')
                .select('is_active')
                .eq('id', user.id)
                .single();

            if (profileData && profileData.is_active === false) {
                console.log('Usuário autenticado, mas marcado como inativo na tabela profiles');
                await supabase.auth.signOut();
                return false;
            }

            console.log('Autenticado via sessão Supabase (usuário ativo)');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
};

// Logout que limpa tanto Supabase quanto localStorage
export const simpleLogout = async () => {
    try {
        // Limpar localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');

        // Logout do Supabase
        await supabase.auth.signOut();

        console.log('Logout bem-sucedido');
    } catch (error) {
        console.error('Erro durante logout:', error);
    }

    // Redirecionar para login independente de erro
    window.location.href = '/login';
};

// Obter dados do usuário
export const simpleGetUser = async () => {
    try {
        // Tentar obter do Supabase primeiro
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Erro ao obter usuário do Supabase:', error);
            // Tentar obter do backup local
            const localUser = localStorage.getItem('USER_STORAGE_KEY');
            return localUser ? JSON.parse(localUser) : null;
        }

        if (data.user) {
            // Dados básicos do usuário
            const user = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
                avatarUrl: data.user.user_metadata?.avatar_url,
                lastLogin: new Date(data.user.last_sign_in_at || Date.now()).toLocaleString()
            };

            return user;
        }

        // Fallback para localStorage
        const email = localStorage.getItem('userEmail');
        return {
            name: email ? email.split('@')[0] : 'Usuário',
            email: email || 'usuario@exemplo.com',
            lastLogin: new Date().toLocaleString()
        };
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);

        // Fallback para dados locais
        const email = localStorage.getItem('userEmail');
        return {
            name: email ? email.split('@')[0] : 'Usuário',
            email: email || 'usuario@exemplo.com',
            lastLogin: new Date().toLocaleString()
        };
    }
};

// Função para recuperação de senha
export const simpleRequestPasswordReset = async (email) => {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        throw error;
    }
};

// Adicione isto ao src/lib/simple-auth.js

// Verificar se o usuário atual tem privilégios de administrador
export const isAdmin = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        // Verificar na tabela de profiles se o usuário é admin
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || !data) return false;

        return data.role === 'admin';
    } catch (error) {
        console.error('Erro ao verificar privilégios de administrador:', error);
        return false;
    }
};

export const login = async (email, password) => {
    try {
        console.log('Iniciando login para:', email);

        // Autenticar com Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Erro na autenticação:', error.message);
            throw error;
        }

        // Verificar se o usuário tem o status de desativado (app_metadata.disabled = true)
        if (data.user?.app_metadata?.disabled === true) {
            console.error('Tentativa de login com usuário desativado:', email);
            // Fazer logout explícito para limpar qualquer sessão
            await supabase.auth.signOut();

            // Lançar erro específico para usuário inativo
            const inactiveError = new Error('Usuário inativo');
            inactiveError.code = 'USER_INACTIVE';
            throw inactiveError;
        }

        // Verificar também na tabela profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', data.user.id)
            .single();

        if (!profileError && profileData && profileData.is_active === false) {
            console.error('Tentativa de login com usuário marcado como inativo na tabela profiles:', email);
            await supabase.auth.signOut();

            // Lançar erro específico para usuário inativo
            const inactiveError = new Error('Usuário inativo');
            inactiveError.code = 'USER_INACTIVE';
            throw inactiveError;
        }

        // Armazenar backup de autenticação
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);

        return data;
    } catch (error) {
        console.error('Erro no processo de login:', error);
        throw error;
    }
};


// Listar todos os usuários (apenas para administradores)
export const listUsers = async () => {
    try {
        // Primeiro, obter usuários da tabela auth.users via função RPC
        // Note: Você precisará criar esta função no Supabase SQL Editor
        const { data: authUsers, error: authError } = await supabase
            .rpc('get_all_users');

        if (authError) throw authError;

        // Obter dados adicionais da tabela profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) throw profilesError;

        // Combinar os dados
        const users = authUsers.map(authUser => {
            const profile = profiles.find(p => p.id === authUser.id) || {};
            return {
                ...authUser,
                ...profile
            };
        });

        return users;
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        throw error;
    }
};

// Criar um novo usuário (apenas para administradores)
export const createUser = async (userData) => {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao criar usuário');
        }

        return data;
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
    }
};

// Atualizar usuário existente (apenas para administradores)
export const updateUser = async (userId, userData) => {
    try {
        const { email, role, name, company, phone, is_active } = userData;

        // Atualizar dados na tabela profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                name,
                email,
                company,
                phone,
                role,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        // Se houver flag de ativo/inativo, atualizar no Supabase auth
        if (is_active !== undefined) {
            // Esta operação requer funções de admin ou edge functions
            const { error: statusError } = await supabase
                .rpc('set_user_status', {
                    user_id: userId,
                    is_active: is_active
                });

            if (statusError) throw statusError;
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
    }
};

// Excluir usuário (apenas para administradores)
export const deleteUser = async (userId) => {
    try {
        // Esta operação requer funções de admin ou edge functions
        const { error } = await supabase
            .rpc('delete_user', { user_id: userId });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        throw error;
    }
};


