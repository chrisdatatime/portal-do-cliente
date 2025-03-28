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

        // Busca as solicitações de serviço do usuário atual
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar solicitações:', error);
            return NextResponse.json(
                { error: 'Erro ao buscar solicitações' },
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

        // O corpo da requisição pode ser um FormData ou JSON
        let requestData;
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // Processar FormData
            const formData = await request.formData();
            requestData = Object.fromEntries(formData);

            // Tratamento específico para files
            const attachments = formData.getAll('attachments');
            if (attachments && attachments.length > 0) {
                requestData.attachments = attachments;
            }
        } else {
            // Processar JSON
            requestData = await request.json();
        }

        // Validar campos obrigatórios
        const { name, email, serviceType, description } = requestData;
        if (!name || !email || !serviceType || !description) {
            return NextResponse.json(
                { error: 'Campos obrigatórios não fornecidos' },
                { status: 400 }
            );
        }

        const supabase = initSupabase();

        // Criar a solicitação no banco de dados
        const { data, error } = await supabase
            .from('service_requests')
            .insert([
                {
                    user_id: user.id,
                    name,
                    email,
                    phone: requestData.phone || '',
                    service_type: serviceType,
                    description,
                    urgency: requestData.urgency || 'normal',
                    status: 'pending', // Status inicial
                }
            ])
            .select();

        if (error) {
            console.error('Erro ao criar solicitação:', error);
            return NextResponse.json(
                { error: 'Erro ao criar solicitação' },
                { status: 500 }
            );
        }

        // Se tiver anexos, processar e salvar no storage
        if (requestData.attachments && requestData.attachments.length > 0 && data?.[0]?.id) {
            const serviceRequestId = data[0].id;
            const uploadResults = [];

            for (const file of requestData.attachments) {
                // Obter o arquivo do FormData
                const fileName = `${serviceRequestId}/${Date.now()}-${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('service_attachments')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Erro ao fazer upload de anexo:', uploadError);
                } else {
                    uploadResults.push({
                        service_request_id: serviceRequestId,
                        file_name: file.name,
                        file_path: fileName,
                        file_size: file.size,
                        file_type: file.type
                    });
                }
            }

            // Salvar referências de arquivo no banco de dados se houver uploads bem-sucedidos
            if (uploadResults.length > 0) {
                const { error: attachmentError } = await supabase
                    .from('service_attachments')
                    .insert(uploadResults);

                if (attachmentError) {
                    console.error('Erro ao salvar referências de anexos:', attachmentError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Solicitação criada com sucesso',
            data: data?.[0]
        });
    } catch (error) {
        console.error('Erro na requisição POST:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 