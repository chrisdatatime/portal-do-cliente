import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Inicializar cliente Supabase
const initSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
};

// Captura o usuário atual baseado no cookie de sessão
async function getCurrentUser() {
    const cookieStore = cookies();
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data } = await supabaseClient.auth.getUser();
    return data?.user;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const supabase = initSupabase();

        // Buscar os chamados de suporte do usuário atual
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
        *,
        messages:support_ticket_messages(*)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar chamados:', error);
            return NextResponse.json(
                { error: 'Erro ao buscar chamados' },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Erro na requisição GET:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const requestData = await request.json();

        // Validar campos obrigatórios
        const { title, description, category } = requestData;
        if (!title || !description || !category) {
            return NextResponse.json(
                { error: 'Campos obrigatórios não fornecidos' },
                { status: 400 }
            );
        }

        const supabase = initSupabase();

        // Criar um ID único para o chamado
        const ticketId = `TICKET-${new Date().getTime().toString().slice(-6)}`;

        // Iniciar transação para criar chamado e primeira mensagem juntos
        const { data, error } = await supabase
            .from('support_tickets')
            .insert([
                {
                    id: ticketId,
                    user_id: user.id,
                    title,
                    description,
                    category,
                    priority: requestData.priority || 'medium',
                    status: 'open',
                }
            ])
            .select();

        if (error) {
            console.error('Erro ao criar chamado:', error);
            return NextResponse.json(
                { error: 'Erro ao criar chamado' },
                { status: 500 }
            );
        }

        // Adicionar a primeira mensagem ao chamado (a própria descrição)
        const { error: messageError } = await supabase
            .from('support_ticket_messages')
            .insert([
                {
                    ticket_id: ticketId,
                    user_id: user.id,
                    message: description,
                    is_from_user: true,
                }
            ]);

        if (messageError) {
            console.error('Erro ao adicionar mensagem inicial:', messageError);
            // Mesmo se falhar ao adicionar a primeira mensagem, o chamado já foi criado
        }

        return NextResponse.json({
            success: true,
            message: 'Chamado criado com sucesso',
            data: data?.[0],
        });
    } catch (error) {
        console.error('Erro na requisição POST:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 