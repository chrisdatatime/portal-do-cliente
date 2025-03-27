// src/app/api/admin/workspaces/[id]/links/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/workspaces/[id]/links - Get associations for a workspace
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const workspaceId = params.id;

        // Verify admin permission
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem acessar associações.' },
                { status: 403 }
            );
        }

        // Initialize Supabase client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Fetch associations
        const { data: associations, error } = await supabaseAdmin
            .from('workspace_companies')
            .select('company_id')
            .eq('workspace_id', workspaceId);

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao buscar associações: ' + error.message },
                { status: 500 }
            );
        }

        const companyIds = associations.map(assoc => assoc.company_id);
        return NextResponse.json({ companies: companyIds });
    } catch (error: any) {
        console.error('Erro ao buscar associações:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/workspaces/[id]/links - Update associations for a workspace
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const workspaceId = params.id;

        // Verify admin permission
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem atualizar associações.' },
                { status: 403 }
            );
        }

        // Get request data
        const { companies = [] } = await request.json();

        // Initialize Supabase client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Verify if workspace exists
        const { data: existingWorkspace, error: checkError } = await supabaseAdmin
            .from('workspaces')
            .select('id')
            .eq('id', workspaceId)
            .single();

        if (checkError || !existingWorkspace) {
            return NextResponse.json(
                { error: 'Workspace não encontrado' },
                { status: 404 }
            );
        }

        // Remove all existing associations
        const { error: deleteError } = await supabaseAdmin
            .from('workspace_companies')
            .delete()
            .eq('workspace_id', workspaceId);

        if (deleteError) {
            return NextResponse.json(
                { error: 'Erro ao remover associações existentes: ' + deleteError.message },
                { status: 500 }
            );
        }

        // Add new associations
        if (companies.length > 0) {
            const associations = companies.map((companyId: string) => ({
                workspace_id: workspaceId,
                company_id: companyId
            }));

            const { error: insertError } = await supabaseAdmin
                .from('workspace_companies')
                .insert(associations);

            if (insertError) {
                return NextResponse.json(
                    { error: 'Erro ao criar novas associações: ' + insertError.message },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, companies });
    } catch (error: any) {
        console.error('Erro ao atualizar associações:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}