import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

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

// Rota GET para obter todos os dashboards
export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        // Criar cliente Supabase
        const supabase = initSupabase();

        // Buscar todos os dashboards
        const { data, error } = await supabase
            .from('dashboards')
            .select('*, dashboard_workspaces(workspace_id)');

        if (error) {
            console.error('Erro ao buscar dashboards:', error);
            return NextResponse.json({ error: 'Erro ao buscar dashboards' }, { status: 500 });
        }

        // Transformar os dados para o formato esperado
        const formattedData = data.map(dashboard => {
            // Extrair os IDs dos workspaces associados
            const workspaces = dashboard.dashboard_workspaces
                ? dashboard.dashboard_workspaces.map((relation: any) => relation.workspace_id)
                : [];

            // Remover a relação original e adicionar apenas os IDs
            const { dashboard_workspaces, ...dashboardData } = dashboard;
            return {
                ...dashboardData,
                workspaces
            };
        });

        return NextResponse.json(formattedData);
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// Rota POST para criar um novo dashboard
export async function POST(request: NextRequest) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        // Extrair dados da requisição
        const body = await request.json();

        // Validar dados obrigatórios
        if (!body.title || !body.embed_url) {
            return NextResponse.json({ error: 'Título e URL do embed são obrigatórios' }, { status: 400 });
        }

        // Extrair workspaces para associar ao dashboard
        const { workspaces, ...dashboardData } = body;

        // Criar cliente Supabase
        const supabase = initSupabase();

        // Gerar ID único para o dashboard
        const dashboardId = uuidv4();

        // Inserir o dashboard na tabela
        const { data, error } = await supabase
            .from('dashboards')
            .insert({
                id: dashboardId,
                title: dashboardData.title,
                description: dashboardData.description || null,
                category: dashboardData.category || null,
                type: dashboardData.type || null,
                embed_url: dashboardData.embed_url,
                thumbnail: dashboardData.thumbnail || null,
                is_new: dashboardData.is_new || false,
                is_favorite: false
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar dashboard:', error);
            return NextResponse.json({ error: 'Erro ao criar dashboard' }, { status: 500 });
        }

        // Se houver workspaces para associar, criar as associações
        if (workspaces && workspaces.length > 0) {
            const workspaceRelations = workspaces.map((workspaceId: string) => ({
                dashboard_id: dashboardId,
                workspace_id: workspaceId
            }));

            const { error: relError } = await supabase
                .from('dashboard_workspaces')
                .insert(workspaceRelations);

            if (relError) {
                console.error('Erro ao associar workspaces ao dashboard:', relError);
                // Não falhar a operação principal, apenas registrar o erro
            }
        }

        return NextResponse.json({
            message: 'Dashboard criado com sucesso',
            dashboard: {
                ...data,
                workspaces: workspaces || []
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 