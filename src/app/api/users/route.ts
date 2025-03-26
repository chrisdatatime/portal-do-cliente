import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('API: Buscando usuários...');

        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Primeiro, buscar perfis
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*');

        if (profilesError) {
            console.error('Erro ao buscar perfis:', profilesError);
            throw profilesError;
        }

        // Depois, buscar informações dos usuários
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) {
            console.error('Erro ao buscar usuários auth:', authError);
        }

        // Mapear informações combinadas
        const users = profiles.map(profile => {
            // Encontrar informações de auth para esse usuário
            const authUser = authData?.users?.find(u => u.id === profile.id);

            // Verificar se o usuário está desativado via app_metadata
            const isDisabled = authUser?.app_metadata?.disabled === true;

            // Determinar se está ativo
            const isActive = authUser ? !isDisabled : (profile.is_active !== false);

            return {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                company: profile.company,
                phone: profile.phone,
                role: profile.role,
                created_at: authUser?.created_at || profile.created_at,
                last_sign_in_at: authUser?.last_sign_in_at,
                is_active: isActive
            };
        });

        console.log(`API: ${users.length} usuários encontrados`);
        return NextResponse.json(users);
    } catch (error: any) {
        console.error('Erro ao listar usuários:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userData = await request.json();
        console.log('API: Criando usuário:', userData.email);

        // Verificação básica
        if (!userData.email || !userData.password) {
            return NextResponse.json(
                { error: 'Email e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Inicializar Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Criar usuário
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: userData.password,
            email_confirm: true
        });

        if (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }

        if (data.user) {
            // Criar perfil
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: userData.email,
                    name: userData.name || '',
                    company: userData.company || '',
                    phone: userData.phone || '',
                    role: userData.role || 'user',
                    updated_at: new Date().toISOString()
                });
        }

        console.log('API: Usuário criado com sucesso');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}