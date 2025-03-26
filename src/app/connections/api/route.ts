// src/app/api/connections/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

interface Connection {
    id: string;
    name: string;
    logo: string;
    status: 'active' | 'failed' | 'pending';
    lastSync: string;
    type: string;
    description?: string;
    config?: Record<string, any>;
}

// GET /api/connections - Listar todas as conexões
export async function GET(request: Request) {
    try {
        // Inicializar cliente Supabase
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

        // Buscar todas as conexões
        const { data: connections, error: connectionsError } = await supabaseAdmin
            .from('connections')
            .select('*')
            .order('created_at', { ascending: false });

        if (connectionsError) {
            return NextResponse.json(
                { error: 'Erro ao buscar conexões' },
                { status: 500 }
            );
        }

        // Formatar dados para o formato esperado pelo frontend
        const formattedConnections: Connection[] = connections.map(conn => ({
            id: conn.id,
            name: conn.name,
            logo: conn.logo_url || `/logos/${conn.type.toLowerCase()}.png`,
            status: conn.status,
            lastSync: conn.last_sync || conn.created_at,
            type: conn.type,
            description: conn.description
        }));

        return NextResponse.json(formattedConnections);

    } catch (error: any) {
        console.error('Erro ao obter conexões:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/connections - Criar uma nova conexão
export async function POST(request: Request) {
    try {
        // Apenas administradores podem criar conexões
        const isUserAdmin = await isAdmin();

        if (!isUserAdmin) {
            return NextResponse.json(
                { error: 'Permissão negada. Apenas administradores podem criar conexões.' },
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
        const connectionData = await request.json();

        // Validar dados obrigatórios
        if (!connectionData.name || !connectionData.type) {
            return NextResponse.json(
                { error: 'Nome e tipo são campos obrigatórios' },
                { status: 400 }
            );
        }

        // Preparar objeto para inserção
        const newConnection = {
            name: connectionData.name,
            type: connectionData.type,
            description: connectionData.description || null,
            logo_url: connectionData.logo || null,
            status: 'pending', // Status inicial é sempre pendente
            config: connectionData.config || {},
            created_at: new Date().toISOString(),
            last_sync: null
        };

        // Inserir nova conexão
        const { data, error } = await supabaseAdmin
            .from('connections')
            .insert(newConnection)
            .select('*')
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao criar conexão: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error: any) {
        console.error('Erro ao criar conexão:', error);

        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}