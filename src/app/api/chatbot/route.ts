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

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        // Permitir uso mesmo sem autenticação, mas registrar se houver usuário
        const userId = user?.id || 'anonymous';

        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Mensagem inválida' },
                { status: 400 }
            );
        }

        const supabase = initSupabase();

        // Salvar a mensagem do usuário no histórico
        await supabase
            .from('chatbot_messages')
            .insert([
                {
                    user_id: userId,
                    message,
                    is_from_user: true,
                    session_id: request.headers.get('x-session-id') || new Date().toISOString(),
                }
            ]);

        // Determinar a resposta (lógica simples baseada em palavras-chave)
        const response = getAutoResponse(message);

        // Salvar a resposta do bot no histórico
        await supabase
            .from('chatbot_messages')
            .insert([
                {
                    user_id: userId,
                    message: response,
                    is_from_user: false,
                    session_id: request.headers.get('x-session-id') || new Date().toISOString(),
                }
            ]);

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Erro na API do chatbot:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// Função temporária para respostas automáticas simples
function getAutoResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') ||
        lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') ||
        lowerMessage.includes('boa noite')) {
        return 'Olá! Como posso ajudar você hoje?';
    }

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte')) {
        return 'Estou aqui para ajudar! Você pode abrir um chamado na aba "Suporte" ou me perguntar sobre os serviços disponíveis.';
    }

    if (lowerMessage.includes('serviço') || lowerMessage.includes('produto')) {
        return 'Oferecemos diversos serviços como manutenção, suporte técnico, consultoria e mais. Você pode verificar todos os detalhes na seção "Serviços".';
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custo')) {
        return 'Os preços variam de acordo com o serviço. Para obter um orçamento personalizado, recomendo abrir uma solicitação na aba "Serviços".';
    }

    if (lowerMessage.includes('prazo') || lowerMessage.includes('tempo')) {
        return 'Os prazos de entrega dependem do tipo de serviço solicitado. Normalmente, respondemos solicitações em até 24 horas úteis e o prazo de execução é informado após a análise inicial.';
    }

    if (lowerMessage.includes('problema') || lowerMessage.includes('erro') || lowerMessage.includes('não funciona')) {
        return 'Sinto muito pelo inconveniente. Recomendo abrir um chamado de suporte para que nossa equipe técnica possa analisar e resolver seu problema o mais rápido possível.';
    }

    if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada') || lowerMessage.includes('valeu')) {
        return 'De nada! Estou sempre à disposição para ajudar. Precisa de mais alguma coisa?';
    }

    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('email')) {
        return 'Você pode entrar em contato conosco pelo telefone (11) 1234-5678 ou pelo e-mail contato@empresa.com.br. Também atendemos pelo WhatsApp.';
    }

    if (lowerMessage.includes('chamado') || lowerMessage.includes('ticket')) {
        return 'Para acompanhar seus chamados, acesse a aba "Suporte". Lá você encontrará o histórico de todas as suas solicitações e o status atual de cada uma.';
    }

    // Resposta padrão para outras mensagens
    return 'Entendi. Para melhor atendimento, recomendo que você abra um chamado detalhando sua necessidade. Nossa equipe especializada irá analisar seu caso e responder o mais breve possível.';
} 