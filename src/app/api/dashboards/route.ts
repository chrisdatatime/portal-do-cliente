import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { simpleGetUser } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// Inicializar cliente Supabase
const initSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
};

// GET /api/dashboards - Listar dashboards disponíveis para o usuário
export async function GET(request: Request) {
    try {
        // Obter informações do usuário autenticado
        const user = await simpleGetUser();

        if (!user || !user.id) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        const supabase = initSupabase();

        // Buscar perfil do usuário para obter a empresa
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Erro ao buscar perfil do usuário:', profileError);
            return NextResponse.json(
                { error: 'Erro ao identificar empresa do usuário' },
                { status: 500 }
            );
        }

        if (!profile.company_id) {
            return NextResponse.json(
                { error: 'Usuário não está associado a nenhuma empresa' },
                { status: 400 }
            );
        }

        // Buscar workspaces associados à empresa do usuário
        const { data: companyWorkspaces, error: workspacesError } = await supabase
            .from('workspace_companies')
            .select('workspace_id')
            .eq('company_id', profile.company_id);

        if (workspacesError) {
            console.error('Erro ao buscar workspaces da empresa:', workspacesError);
            return NextResponse.json(
                { error: 'Erro ao buscar workspaces disponíveis' },
                { status: 500 }
            );
        }

        // Se não houver workspaces, retornar lista vazia
        if (!companyWorkspaces.length) {
            return NextResponse.json([]);
        }

        const workspaceIds = companyWorkspaces.map(w => w.workspace_id);

        // Buscar associações de dashboards com os workspaces da empresa
        const { data: dashboardAssociations, error: associationsError } = await supabase
            .from('dashboard_workspaces')
            .select('dashboard_id')
            .in('workspace_id', workspaceIds);

        if (associationsError) {
            console.error('Erro ao buscar associações de dashboards:', associationsError);
            return NextResponse.json(
                { error: 'Erro ao buscar dashboards associados aos workspaces' },
                { status: 500 }
            );
        }

        // Se não houver dashboards associados, retornar lista vazia
        if (!dashboardAssociations.length) {
            return NextResponse.json([]);
        }

        const dashboardIds = [...new Set(dashboardAssociations.map(d => d.dashboard_id))];

        // Buscar detalhes dos dashboards permitidos
        const { data: dashboards, error: dashboardsError } = await supabase
            .from('dashboards')
            .select('*')
            .in('id', dashboardIds)
            .order('created_at', { ascending: false });

        if (dashboardsError) {
            console.error('Erro ao buscar dashboards:', dashboardsError);
            return NextResponse.json(
                { error: 'Erro ao buscar dashboards disponíveis' },
                { status: 500 }
            );
        }

        // Buscar favorites do usuário
        const { data: favorites, error: favoritesError } = await supabase
            .from('user_favorites')
            .select('dashboard_id')
            .eq('user_id', user.id);

        if (favoritesError) {
            console.warn('Erro ao buscar favoritos:', favoritesError);
            // Continuar sem os favoritos
        }

        const favoriteIds = favorites?.map(f => f.dashboard_id) || [];

        // Formatar dados para o frontend
        const formattedDashboards = dashboards.map(dashboard => ({
            id: dashboard.id,
            title: dashboard.title,
            category: dashboard.category,
            type: dashboard.type,
            description: dashboard.description,
            lastUpdated: dashboard.updated_at || dashboard.created_at,
            isFavorite: favoriteIds.includes(dashboard.id),
            thumbnail: dashboard.thumbnail,
            isNew: dashboard.is_new,
            embedUrl: dashboard.embed_url
        }));

        return NextResponse.json(formattedDashboards);
    } catch (error: any) {
        console.error('Erro ao listar dashboards:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 