import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const initSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
};

// GET /api/user/role - Obter papel do usuário atual
export async function GET(request: Request) {
    try {
        const supabase = initSupabase();

        // Obter sessão do usuário
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Buscar workspace do usuário
        const { data: workspaceUser, error: workspaceError } = await supabase
            .from('workspace_users')
            .select(`
                role,
                workspace:workspaces (
                    id,
                    owner_id
                )
            `)
            .eq('user_id', userId)
            .single();

        if (workspaceError) {
            return NextResponse.json(
                { error: 'Erro ao buscar papel do usuário' },
                { status: 500 }
            );
        }

        // Verificar se o usuário é dono do workspace
        const isOwner = workspaceUser?.workspace?.owner_id === userId;
        const isAdmin = workspaceUser?.role === 'admin';
        const workspaceId = workspaceUser?.workspace?.id;

        return NextResponse.json({
            isOwner,
            isAdmin,
            workspaceId,
            role: workspaceUser?.role || 'user'
        });

    } catch (error: any) {
        console.error('Erro ao verificar papel do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 