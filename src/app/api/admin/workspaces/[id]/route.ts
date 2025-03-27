// src/app/api/companies/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// GET /api/companies/[id] - Obter detalhes de uma empresa
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Buscar empresa
        const { data: company, error } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Empresa não encontrada' },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: 'Erro ao buscar empresa: ' + error.message },
                { status: 500 }
            );
        }

        // Contar usuários
        const { count, error: countError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', id)
            .eq('is_active', true);

        if (countError) {
            console.error('Erro ao contar usuários:', countError);
        }

        return NextResponse.json({
            ...company,
            user_count: count || 0
        });
    } catch (error: any) {
        console.error('Erro ao obter empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PUT /api/companies/[id] - Atualizar empresa
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Verificar se o usuário é administrador
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem atualizar empresas.' },
                { status: 403 }
            );
        }

        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Obter dados da requisição
        const updateData = await request.json();

        // Verificar se a empresa existe
        const { data: existingCompany, error: checkError } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingCompany) {
            return NextResponse.json(
                { error: 'Empresa não encontrada' },
                { status: 404 }
            );
        }

        // Preparar objeto para atualização
        const updatedCompany = {
            ...(updateData.name && { name: updateData.name }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.logo && { logo_url: updateData.logo }),
            updated_at: new Date().toISOString()
        };

        // Atualizar empresa
        const { data, error } = await supabaseAdmin
            .from('companies')
            .update(updatedCompany)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao atualizar empresa: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Erro ao atualizar empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE /api/companies/[id] - Remover empresa
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Verificar se o usuário é administrador
        const isUserAdmin = await isAdmin();
        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem remover empresas.' },
                { status: 403 }
            );
        }

        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Verificar se a empresa existe
        const { data: existingCompany, error: checkError } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingCompany) {
            return NextResponse.json(
                { error: 'Empresa não encontrada' },
                { status: 404 }
            );
        }

        // Verificar se há usuários associados à empresa
        const { count, error: countError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', id);

        if (count && count > 0) {
            return NextResponse.json(
                { error: 'Não é possível excluir empresa com usuários associados' },
                { status: 400 }
            );
        }

        // Remover empresa
        const { error } = await supabaseAdmin
            .from('companies')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao remover empresa: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao remover empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}