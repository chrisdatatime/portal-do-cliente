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

// GET /api/workspaces/:id - Obter detalhes do workspace
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = initSupabase();
        const workspaceId = params.id;

        // Verificar se o usuário tem acesso ao workspace
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Buscar workspace com usuários e licença
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .select(`
                *,
                company:companies (
                    id,
                    name,
                    license:licenses (*)
                ),
                users:workspace_users (
                    id,
                    user_id,
                    role,
                    status,
                    users (
                        email,
                        name,
                        last_sign_in_at
                    )
                )
            `)
            .eq('id', workspaceId)
            .single();

        if (workspaceError) {
            return NextResponse.json(
                { error: 'Erro ao buscar workspace' },
                { status: 500 }
            );
        }

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace não encontrado' },
                { status: 404 }
            );
        }

        // Calcular estatísticas
        const stats = {
            totalUsers: workspace.users.length,
            activeUsers: workspace.users.filter(u => u.status === 'active').length,
            pendingInvites: workspace.users.filter(u => u.status === 'invited').length,
            licenseUsage: Math.round((workspace.users.length / workspace.company.license.max_users) * 100)
        };

        // Formatar dados para o frontend
        const formattedWorkspace = {
            id: workspace.id,
            name: workspace.name,
            companyId: workspace.company_id,
            ownerId: workspace.owner_id,
            settings: workspace.settings,
            users: workspace.users.map(u => ({
                id: u.id,
                email: u.users.email,
                name: u.users.name,
                role: u.role,
                status: u.status,
                lastAccess: u.users.last_sign_in_at
            })),
            createdAt: workspace.created_at,
            updatedAt: workspace.updated_at
        };

        return NextResponse.json({
            workspace: formattedWorkspace,
            stats,
            license: workspace.company.license
        });

    } catch (error: any) {
        console.error('Erro ao obter detalhes do workspace:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PATCH /api/workspaces/:id/settings - Atualizar configurações do workspace
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = initSupabase();
        const workspaceId = params.id;
        const updates = await request.json();

        // Verificar se o usuário tem acesso ao workspace
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é owner ou admin
        const { data: userRole } = await supabase
            .from('workspace_users')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', session.user.id)
            .single();

        if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
            return NextResponse.json(
                { error: 'Permissão negada' },
                { status: 403 }
            );
        }

        // Atualizar configurações
        const { data: workspace, error: updateError } = await supabase
            .from('workspaces')
            .update({
                settings: updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', workspaceId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: 'Erro ao atualizar configurações' },
                { status: 500 }
            );
        }

        return NextResponse.json(workspace);

    } catch (error: any) {
        console.error('Erro ao atualizar configurações:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 