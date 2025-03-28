// src/app/api/admin/workspaces/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// Função utilitária para inicializar o cliente Supabase
const initSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }

    return createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: { persistSession: false },
            global: { headers: { 'X-Client-Info': 'admin-workspaces-api' } }
        }
    );
};

// GET /api/admin/workspaces/[id] - Obter detalhes de um workspace específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminStatus = await isAdmin();
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Acesso não autorizado. Apenas administradores podem acessar esta API.' },
                { status: 403 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'ID do workspace é obrigatório' },
                { status: 400 }
            );
        }

        const supabaseAdmin = initSupabase();

        // Buscar workspace pelo ID
        const { data: workspace, error: workspaceError } = await supabaseAdmin
            .from('workspaces')
            .select('*')
            .eq('id', id)
            .single();

        if (workspaceError) {
            console.error(`Erro ao buscar workspace ${id}:`, workspaceError);

            if (workspaceError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Workspace não encontrado' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `Erro ao buscar workspace: ${workspaceError.message}` },
                { status: 500 }
            );
        }

        // Buscar associações de empresas
        try {
            const { data: associations, error: associationsError } = await supabaseAdmin
                .from('workspace_companies')
                .select('company_id')
                .eq('workspace_id', id);

            if (!associationsError && associations) {
                const companies = associations.map(a => a.company_id);
                return NextResponse.json({ ...workspace, companies });
            }

            // Se houver erro nas associações, apenas retorna o workspace sem elas
            return NextResponse.json({ ...workspace, companies: [] });
        } catch (error) {
            // Erro nas associações não deve impedir de retornar o workspace
            console.warn(`Erro ao buscar associações para workspace ${id}:`, error);
            return NextResponse.json({ ...workspace, companies: [] });
        }
    } catch (error: any) {
        console.error('Erro ao obter detalhes do workspace:', error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error.message || 'Erro desconhecido'}` },
            { status: 500 }
        );
    }
}

// PUT /api/admin/workspaces/[id] - Atualizar um workspace existente
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminStatus = await isAdmin();
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Acesso não autorizado. Apenas administradores podem atualizar workspaces.' },
                { status: 403 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'ID do workspace é obrigatório' },
                { status: 400 }
            );
        }

        const updateData = await request.json();
        const { name, description, owner, companies } = updateData;

        if (!name) {
            return NextResponse.json(
                { error: 'Nome do workspace é obrigatório' },
                { status: 400 }
            );
        }

        const supabaseAdmin = initSupabase();

        // Verificar se o workspace existe
        const { data: existingWorkspace, error: checkError } = await supabaseAdmin
            .from('workspaces')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Workspace não encontrado' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `Erro ao verificar workspace: ${checkError.message}` },
                { status: 500 }
            );
        }

        // Atualizar workspace
        const { data: workspace, error: updateError } = await supabaseAdmin
            .from('workspaces')
            .update({
                name,
                description,
                owner,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*')
            .single();

        if (updateError) {
            console.error(`Erro ao atualizar workspace ${id}:`, updateError);
            return NextResponse.json(
                { error: `Erro ao atualizar workspace: ${updateError.message}` },
                { status: 500 }
            );
        }

        // Atualizar associações de empresas se fornecidas
        if (Array.isArray(companies)) {
            try {
                // Primeiro remover associações existentes
                const { error: deleteError } = await supabaseAdmin
                    .from('workspace_companies')
                    .delete()
                    .eq('workspace_id', id);

                if (deleteError) {
                    console.warn(`Erro ao remover associações do workspace ${id}:`, deleteError);
                }

                // Adicionar novas associações se houver empresas
                if (companies.length > 0) {
                    const associations = companies.map(companyId => ({
                        workspace_id: id,
                        company_id: companyId
                    }));

                    const { error: insertError } = await supabaseAdmin
                        .from('workspace_companies')
                        .insert(associations);

                    if (insertError) {
                        console.warn(`Erro ao adicionar associações ao workspace ${id}:`, insertError);
                        return NextResponse.json({
                            ...workspace,
                            companies: [],
                            warning: `Workspace atualizado, mas houve erro ao vincular empresas: ${insertError.message}`
                        });
                    }
                }

                return NextResponse.json({ ...workspace, companies });
            } catch (error: any) {
                console.warn(`Erro ao gerenciar associações do workspace ${id}:`, error);
                return NextResponse.json({
                    ...workspace,
                    companies: [],
                    warning: `Workspace atualizado, mas houve erro ao gerenciar associações: ${error.message || 'Erro desconhecido'}`
                });
            }
        }

        // Se não foram fornecidas empresas, retornar apenas o workspace atualizado
        return NextResponse.json(workspace);
    } catch (error: any) {
        console.error('Erro ao atualizar workspace:', error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error.message || 'Erro desconhecido'}` },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/workspaces/[id] - Excluir um workspace
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verificar se o usuário é administrador
        const adminStatus = await isAdmin();
        if (!adminStatus) {
            return NextResponse.json(
                { error: 'Acesso não autorizado. Apenas administradores podem excluir workspaces.' },
                { status: 403 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'ID do workspace é obrigatório' },
                { status: 400 }
            );
        }

        const supabaseAdmin = initSupabase();

        // Verificar se o workspace existe
        const { data: existingWorkspace, error: checkError } = await supabaseAdmin
            .from('workspaces')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Workspace não encontrado' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `Erro ao verificar workspace: ${checkError.message}` },
                { status: 500 }
            );
        }

        // Primeiro remover associações
        try {
            await supabaseAdmin
                .from('workspace_companies')
                .delete()
                .eq('workspace_id', id);
        } catch (error: any) {
            console.warn(`Erro ao remover associações do workspace ${id}:`, error);
            // Continuar com a exclusão do workspace mesmo se houver erro nas associações
        }

        // Excluir o workspace
        const { error: deleteError } = await supabaseAdmin
            .from('workspaces')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error(`Erro ao excluir workspace ${id}:`, deleteError);
            return NextResponse.json(
                { error: `Erro ao excluir workspace: ${deleteError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Workspace excluído com sucesso' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Erro ao excluir workspace:', error);
        return NextResponse.json(
            { error: `Erro interno do servidor: ${error.message || 'Erro desconhecido'}` },
            { status: 500 }
        );
    }
}