import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';
import { cookies } from 'next/headers';

// Define dynamic route para evitar cache
export const dynamic = 'force-dynamic';

// Inicializar cliente Supabase
const initSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
};

// Rota GET para obter um dashboard específico por ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        const dashboardId = params.id;
        if (!dashboardId) {
            return NextResponse.json({ error: 'ID do dashboard não fornecido' }, { status: 400 });
        }

        // Criar cliente Supabase
        const supabase = initSupabase();

        // Buscar o dashboard pelo ID
        const { data: dashboard, error: dashboardError } = await supabase
            .from('dashboards')
            .select('*')
            .eq('id', dashboardId)
            .single();

        if (dashboardError) {
            if (dashboardError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Dashboard não encontrado' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Erro ao buscar dashboard' }, { status: 500 });
        }

        // Buscar workspaces associados
        const { data: workspaceRelations, error: workspacesError } = await supabase
            .from('dashboard_workspaces')
            .select('workspace_id')
            .eq('dashboard_id', dashboardId);

        if (workspacesError) {
            console.error('Erro ao buscar workspaces associados:', workspacesError);
            // Não falhar a operação, apenas continuar sem workspaces
        }

        // Transformar dados para o formato esperado
        const workspaces = workspaceRelations
            ? workspaceRelations.map(relation => relation.workspace_id)
            : [];

        return NextResponse.json({
            ...dashboard,
            workspaces
        });
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// Rota PUT para atualizar um dashboard específico
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        const dashboardId = params.id;
        if (!dashboardId) {
            return NextResponse.json({ error: 'ID do dashboard não fornecido' }, { status: 400 });
        }

        // Extrair dados da requisição
        const body = await request.json();

        // Validar dados obrigatórios
        if (!body.title || !body.embed_url) {
            return NextResponse.json({ error: 'Título e URL do embed são obrigatórios' }, { status: 400 });
        }

        // Separar workspaces dos dados do dashboard
        const { workspaces, ...dashboardData } = body;

        // Criar cliente Supabase
        const supabase = initSupabase();

        // Verificar se o dashboard existe
        const { data: existingDashboard, error: checkError } = await supabase
            .from('dashboards')
            .select('id')
            .eq('id', dashboardId)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Dashboard não encontrado' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Erro ao verificar existência do dashboard' }, { status: 500 });
        }

        // Atualizar o dashboard
        const { data, error } = await supabase
            .from('dashboards')
            .update({
                title: dashboardData.title,
                description: dashboardData.description || null,
                category: dashboardData.category || null,
                type: dashboardData.type || null,
                embed_url: dashboardData.embed_url,
                thumbnail: dashboardData.thumbnail || null,
                is_new: dashboardData.is_new,
                updated_at: new Date().toISOString()
            })
            .eq('id', dashboardId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar dashboard:', error);
            return NextResponse.json({ error: 'Erro ao atualizar dashboard' }, { status: 500 });
        }

        // Atualizar associações de workspaces
        if (workspaces !== undefined) {
            // Primeiro remover todas as associações existentes
            const { error: deleteError } = await supabase
                .from('dashboard_workspaces')
                .delete()
                .eq('dashboard_id', dashboardId);

            if (deleteError) {
                console.error('Erro ao remover associações de workspaces:', deleteError);
                // Não falhar a operação principal
            }

            // Se houver novos workspaces para associar, criar as novas associações
            if (workspaces && workspaces.length > 0) {
                const workspaceRelations = workspaces.map((workspaceId: string) => ({
                    dashboard_id: dashboardId,
                    workspace_id: workspaceId
                }));

                const { error: insertError } = await supabase
                    .from('dashboard_workspaces')
                    .insert(workspaceRelations);

                if (insertError) {
                    console.error('Erro ao associar workspaces ao dashboard:', insertError);
                    // Não falhar a operação principal
                }
            }
        }

        return NextResponse.json({
            message: 'Dashboard atualizado com sucesso',
            dashboard: {
                ...data,
                workspaces: workspaces || []
            }
        });
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// Rota DELETE para excluir um dashboard específico
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        const dashboardId = params.id;
        if (!dashboardId) {
            return NextResponse.json({ error: 'ID do dashboard não fornecido' }, { status: 400 });
        }

        // Criar cliente Supabase
        const supabase = initSupabase();

        // Verificar se o dashboard existe
        const { data: existingDashboard, error: checkError } = await supabase
            .from('dashboards')
            .select('id')
            .eq('id', dashboardId)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return NextResponse.json({ error: 'Dashboard não encontrado' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Erro ao verificar existência do dashboard' }, { status: 500 });
        }

        // Primeiro, remover todas as associações com workspaces
        const { error: deleteRelError } = await supabase
            .from('dashboard_workspaces')
            .delete()
            .eq('dashboard_id', dashboardId);

        if (deleteRelError) {
            console.error('Erro ao remover associações de workspaces:', deleteRelError);
            // Continue mesmo com erro, tente excluir o dashboard
        }

        // Remover o dashboard
        const { error: deleteError } = await supabase
            .from('dashboards')
            .delete()
            .eq('id', dashboardId);

        if (deleteError) {
            console.error('Erro ao excluir dashboard:', deleteError);
            return NextResponse.json({ error: 'Erro ao excluir dashboard' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Dashboard excluído com sucesso' });
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 