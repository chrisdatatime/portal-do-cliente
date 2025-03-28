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

// POST /api/dashboards/favorites - Adicionar ou remover favorito
export async function POST(request: Request) {
    try {
        // Obter informações do usuário autenticado
        const user = await simpleGetUser();

        if (!user || !user.id) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Obter dados do request
        const { dashboard_id, is_favorite } = await request.json();

        if (!dashboard_id) {
            return NextResponse.json(
                { error: 'ID do dashboard é obrigatório' },
                { status: 400 }
            );
        }

        const supabase = initSupabase();

        // Verificar se o dashboard existe
        const { data: dashboard, error: dashboardError } = await supabase
            .from('dashboards')
            .select('id')
            .eq('id', dashboard_id)
            .single();

        if (dashboardError) {
            console.error('Erro ao verificar dashboard:', dashboardError);

            if (dashboardError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Dashboard não encontrado' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: 'Erro ao verificar dashboard: ' + dashboardError.message },
                { status: 500 }
            );
        }

        // Verificar se o usuário já tem o dashboard como favorito
        const { data: existingFavorite, error: favoriteCheckError } = await supabase
            .from('user_favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('dashboard_id', dashboard_id)
            .maybeSingle();

        if (favoriteCheckError) {
            console.error('Erro ao verificar favorito existente:', favoriteCheckError);
            return NextResponse.json(
                { error: 'Erro ao verificar favorito: ' + favoriteCheckError.message },
                { status: 500 }
            );
        }

        // Adicionar ou remover favorito
        if (is_favorite && !existingFavorite) {
            // Adicionar como favorito
            const { error: insertError } = await supabase
                .from('user_favorites')
                .insert({
                    user_id: user.id,
                    dashboard_id,
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Erro ao adicionar favorito:', insertError);
                return NextResponse.json(
                    { error: 'Erro ao adicionar favorito: ' + insertError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, is_favorite: true });
        } else if (!is_favorite && existingFavorite) {
            // Remover dos favoritos
            const { error: deleteError } = await supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('dashboard_id', dashboard_id);

            if (deleteError) {
                console.error('Erro ao remover favorito:', deleteError);
                return NextResponse.json(
                    { error: 'Erro ao remover favorito: ' + deleteError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, is_favorite: false });
        }

        // Nenhuma mudança necessária
        return NextResponse.json({
            success: true,
            is_favorite: !!existingFavorite,
            message: 'Nenhuma alteração necessária'
        });
    } catch (error: any) {
        console.error('Erro ao gerenciar favorito:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 