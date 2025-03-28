import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const initSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    return createClient(supabaseUrl, supabaseKey);
};

async function getCurrentUser() {
    const cookieStore = cookies();
    const supabaseClient = initSupabase();

    const supabase = createClient(
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

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
        return null;
    }

    const { data: user } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return user;
}

// GET /api/support-tickets/[id] - Obter um ticket específico com suas mensagens
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const supabase = initSupabase();
        const ticketId = params.id;

        // Buscar o ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();

        if (ticketError) {
            return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
        }

        // Buscar as mensagens do ticket
        const { data: messages, error: messagesError } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
        }

        // Converter para o formato esperado pelo frontend
        const formattedTicket = {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            category: ticket.category,
            status: ticket.status,
            createdAt: ticket.created_at,
            messages: messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                sentBy: msg.sent_by,
                createdAt: msg.created_at
            }))
        };

        return NextResponse.json({ ticket: formattedTicket });

    } catch (error) {
        console.error('Erro ao buscar ticket:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// POST /api/support-tickets/[id]/messages - Adicionar uma nova mensagem a um ticket
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const ticketId = params.id;
        const data = await req.json();

        // Validar o corpo da requisição
        if (!data.content || typeof data.content !== 'string') {
            return NextResponse.json({ error: 'É necessário fornecer o conteúdo da mensagem' }, { status: 400 });
        }

        const supabase = initSupabase();

        // Verificar se o ticket existe e pertence ao usuário
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();

        if (ticketError) {
            return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
        }

        // Adicionar a nova mensagem
        const { data: message, error: messageError } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                content: data.content,
                sent_by: 'user',
                user_id: user.id
            })
            .select()
            .single();

        if (messageError) {
            return NextResponse.json({ error: 'Erro ao adicionar mensagem' }, { status: 500 });
        }

        // Atualizar o status do ticket para 'open' se estiver fechado
        if (ticket.status === 'closed') {
            await supabase
                .from('support_tickets')
                .update({ status: 'open', updated_at: new Date().toISOString() })
                .eq('id', ticketId);
        }

        // Formatar mensagem para o frontend
        const formattedMessage = {
            id: message.id,
            content: message.content,
            sentBy: message.sent_by,
            createdAt: message.created_at
        };

        return NextResponse.json({ message: formattedMessage });

    } catch (error) {
        console.error('Erro ao adicionar mensagem:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PATCH /api/support-tickets/[id] - Atualizar o status de um ticket
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const ticketId = params.id;
        const data = await req.json();

        // Validar o corpo da requisição
        if (!data.status || !['open', 'inProgress', 'closed'].includes(data.status)) {
            return NextResponse.json({
                error: 'Status inválido. Valores permitidos: open, inProgress, closed'
            }, { status: 400 });
        }

        const supabase = initSupabase();

        // Verificar se o ticket existe e pertence ao usuário
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();

        if (ticketError) {
            return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 });
        }

        // Atualizar o status do ticket
        const { data: updatedTicket, error: updateError } = await supabase
            .from('support_tickets')
            .update({
                status: data.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: 'Erro ao atualizar o status do ticket' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Status atualizado com sucesso',
            ticket: {
                id: updatedTicket.id,
                status: updatedTicket.status
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar status do ticket:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
} 