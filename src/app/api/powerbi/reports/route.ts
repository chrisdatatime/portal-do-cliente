// src/app/api/powerbi/reports/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface PowerBIReport {
    id: string;
    name: string;
    embedUrl: string;
    type: 'report' | 'dashboard';
    thumbnail?: string;
    description?: string;
    createdAt: string;
    workspace: string;
}

export async function GET(request: Request) {
    try {
        // Inicializar cliente Supabase com a chave de serviço
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Obter o usuário autenticado
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Autorização necessária' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // Verificar sessão do usuário
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !userData.user) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Obter o perfil do usuário para verificar permissões
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role, permissions')
            .eq('id', userData.user.id)
            .single();

        if (profileError) {
            return NextResponse.json(
                { error: 'Erro ao obter perfil do usuário' },
                { status: 500 }
            );
        }

        // Obter relatórios do Power BI
        const { data: reports, error: reportsError } = await supabaseAdmin
            .from('powerbi_reports')
            .select('*');

        if (reportsError) {
            return NextResponse.json(
                { error: 'Erro ao buscar relatórios do Power BI' },
                { status: 500 }
            );
        }

        // Filtrar relatórios com base nas permissões do usuário
        let filteredReports = reports;

        // Se não for administrador, aplicar filtro de permissões
        if (profileData.role !== 'admin') {
            const userPermissions = profileData.permissions || [];

            // Filtrar relatórios que o usuário tem permissão para acessar
            filteredReports = reports.filter(report => {
                const reportPermission = `report:${report.id}`;
                const workspacePermission = `workspace:${report.workspace_id}`;

                return userPermissions.includes(reportPermission) ||
                    userPermissions.includes(workspacePermission) ||
                    userPermissions.includes('reports:all');
            });
        }

        // Formatar dados para o formato esperado pelo frontend
        const formattedReports: PowerBIReport[] = filteredReports.map(report => ({
            id: report.id,
            name: report.name,
            embedUrl: report.embed_url,
            type: report.type,
            thumbnail: report.thumbnail_url,
            description: report.description,
            createdAt: report.created_at,
            workspace: report.workspace_name
        }));

        return NextResponse.json(formattedReports);

    } catch (error: any) {
        console.error('Erro ao obter relatórios do Power BI:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}