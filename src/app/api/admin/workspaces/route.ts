// src/app/api/admin/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

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

// GET /api/admin/workspaces - Listar todos os workspaces
export async function GET(request: NextRequest) {
    try {
        // Verificar se o usuário é administrador
        const adminCheck = await isAdmin();
        if (!adminCheck.isAdmin) {
            return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem acessar esta API.' }, { status: 403 });
        }

        const supabase = initSupabase();

        // Buscar todos os workspaces
        const { data, error } = await supabase
            .from('workspaces')
            .select('*')
            .order('name');

        if (error) {
            console.error('Erro ao buscar workspaces:', error);
            return NextResponse.json({ error: 'Erro ao buscar workspaces' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST /api/admin/workspaces - Criar um novo workspace
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
        if (!body.name) {
            return NextResponse.json({ error: 'Nome do workspace é obrigatório' }, { status: 400 });
        }

        const supabase = initSupabase();

        // Inserir o workspace na tabela
        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                name: body.name,
                description: body.description || null
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar workspace:', error);

            if (error.code === '23505') {
                return NextResponse.json({ error: 'Já existe um workspace com este nome' }, { status: 409 });
            }

            return NextResponse.json({ error: 'Erro ao criar workspace' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Workspace criado com sucesso', workspace: data }, { status: 201 });
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}