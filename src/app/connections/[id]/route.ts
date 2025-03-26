// src/app/api/connections/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// GET /api/connections/[id] - Obter uma conexão específica
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

        // Buscar a conexão específica
        const { data: connection, error } = await supabaseAdmin
            .from('connections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Conexão não encontrada' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: 'Erro ao buscar conexão: ' + error.message },
                { status: 500 }
            );
        }

        // Formatar dados para o frontend
        const formattedConnection = {
            id: connection.id,
            name: connection.name,
            logo: connection.logo_url || `/logos/${connection.type.toLowerCase()}.png`,
            status: connection.status,
            lastSync: connection.last_sync || connection.created_at,
            type: connection.type,
            description: connection.description,
            config: connection.config || {}
        };

        return NextResponse.json(formattedConnection);

    } catch (error: any) {
        console.error('Erro ao obter conexão:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PUT /api/connections/[id] - Atualizar uma conexão
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Apenas administradores podem atualizar conexões
        const isUserAdmin = await isAdmin();

        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem atualizar conexões.' },
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

        // Verificar se a conexão existe
        const { data: existingConnection, error: checkError } = await supabaseAdmin
            .from('connections')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingConnection) {
            return NextResponse.json(
                { error: 'Conexão não encontrada' },
                { status: 404 }
            );
        }

        // Preparar objeto para atualização
        const updatedConnection = {
            ...(updateData.name && { name: updateData.name }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.logo && { logo_url: updateData.logo }),
            ...(updateData.status && { status: updateData.status }),
            ...(updateData.config && { config: updateData.config }),
            updated_at: new Date().toISOString()
        };

        // Atualizar conexão
        const { data, error } = await supabaseAdmin
            .from('connections')
            .update(updatedConnection)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao atualizar conexão: ' + error.message },
                { status: 500 }
            );
        }

        // Formatar dados para o frontend
        const formattedConnection = {
            id: data.id,
            name: data.name,
            logo: data.logo_url || `/logos/${data.type.toLowerCase()}.png`,
            status: data.status,
            lastSync: data.last_sync || data.created_at,
            type: data.type,
            description: data.description,
            config: data.config || {}
        };

        return NextResponse.json(formattedConnection);

    } catch (error: any) {
        console.error('Erro ao atualizar conexão:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE /api/connections/[id] - Remover uma conexão
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Apenas administradores podem remover conexões
        const isUserAdmin = await isAdmin();

        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem remover conexões.' },
                { status: 403 }
            );
        }

        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Verificar se a conexão existe
        const { data: existingConnection, error: checkError } = await supabaseAdmin
            .from('connections')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingConnection) {
            return NextResponse.json(
                { error: 'Conexão não encontrada' },
                { status: 404 }
            );
        }

        // Remover conexão
        const { error } = await supabaseAdmin
            .from('connections')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao remover conexão: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Erro ao remover conexão:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}