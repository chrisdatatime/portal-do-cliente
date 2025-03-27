// src/app/api/admin/workspaces/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/workspaces - List all workspaces
export async function GET(request: Request) {
    try {
        // Verify admin permission
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem acessar workspaces.' },
                { status: 403 }
            );
        }

        // Initialize Supabase client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Fetch workspaces
        const { data: workspaces, error: workspacesError } = await supabaseAdmin
            .from('workspaces')
            .select('*')
            .order('created_at', { ascending: false });

        if (workspacesError) {
            return NextResponse.json(
                { error: 'Erro ao buscar workspaces: ' + workspacesError.message },
                { status: 500 }
            );
        }

        // Fetch workspace-company associations
        const { data: associations, error: associationsError } = await supabaseAdmin
            .from('workspace_companies')
            .select('workspace_id, company_id');

        if (associationsError) {
            return NextResponse.json(
                { error: 'Erro ao buscar associações: ' + associationsError.message },
                { status: 500 }
            );
        }

        // Group associations by workspace
        const workspaceCompanies: Record<string, string[]> = {};
        associations.forEach(assoc => {
            if (!workspaceCompanies[assoc.workspace_id]) {
                workspaceCompanies[assoc.workspace_id] = [];
            }
            workspaceCompanies[assoc.workspace_id].push(assoc.company_id);
        });

        // Add company IDs to each workspace
        const enhancedWorkspaces = workspaces.map(workspace => ({
            ...workspace,
            companies: workspaceCompanies[workspace.id] || []
        }));

        return NextResponse.json(enhancedWorkspaces);
    } catch (error: any) {
        console.error('Erro ao listar workspaces:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/admin/workspaces - Create a new workspace
export async function POST(request: Request) {
    try {
        // Verify admin permission
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem criar workspaces.' },
                { status: 403 }
            );
        }

        // Get request data
        const workspaceData = await request.json();
        const { name, description, owner, companies = [] } = workspaceData;

        if (!name) {
            return NextResponse.json(
                { error: 'Nome do workspace é obrigatório' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Create workspace
        const { data: workspace, error: workspaceError } = await supabaseAdmin
            .from('workspaces')
            .insert({
                name,
                description,
                owner,
                created_at: new Date().toISOString(),
                report_count: 0
            })
            .select('*')
            .single();

        if (workspaceError) {
            return NextResponse.json(
                { error: 'Erro ao criar workspace: ' + workspaceError.message },
                { status: 500 }
            );
        }

        // Link companies to workspace if provided
        if (companies.length > 0) {
            const associations = companies.map(companyId => ({
                workspace_id: workspace.id,
                company_id: companyId
            }));

            const { error: linkError } = await supabaseAdmin
                .from('workspace_companies')
                .insert(associations);

            if (linkError) {
                console.error('Erro ao vincular empresas:', linkError);
                // We still return success, but log the error
            }
        }

        return NextResponse.json(workspace, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar workspace:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}