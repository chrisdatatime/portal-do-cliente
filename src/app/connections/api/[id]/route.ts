import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Função para inicializar Supabase e verificar/criar o bucket de logos
async function initSupabaseAndBucket() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );

    try {
        // Verificar se o bucket 'logos' existe
        const { data: buckets, error: bucketsError } = await supabaseAdmin
            .storage
            .listBuckets();

        if (bucketsError) {
            throw new Error(`Erro ao verificar buckets: ${bucketsError.message}`);
        }

        // Se o bucket não existir, criá-lo
        if (!buckets.find(b => b.name === 'logos')) {
            const { error: createError } = await supabaseAdmin
                .storage
                .createBucket('logos', {
                    public: true,
                    fileSizeLimit: 5 * 1024 * 1024, // 5MB
                });

            if (createError) {
                throw new Error(`Erro ao criar bucket logos: ${createError.message}`);
            }
            console.log('Bucket "logos" criado com sucesso');
        }

        return supabaseAdmin;
    } catch (error: any) {
        console.error('Erro ao inicializar storage:', error);
        throw new Error(`Erro ao inicializar storage: ${error.message}`);
    }
}

// DELETE /connections/api/:id - Excluir uma conexão
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Inicializar cliente Supabase e verificar bucket
        const supabaseAdmin = await initSupabaseAndBucket();

        // Primeiro buscar a conexão para obter o caminho da imagem
        const { data: connection, error: fetchError } = await supabaseAdmin
            .from('connections')
            .select('logo_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Erro ao buscar conexão para exclusão:', fetchError);
        }

        // Excluir a conexão
        const { error } = await supabaseAdmin
            .from('connections')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao excluir conexão: ' + error.message },
                { status: 500 }
            );
        }

        // Se tinha uma imagem armazenada no Storage, excluí-la também
        if (connection?.logo_url && connection.logo_url.startsWith('connections/')) {
            const { error: storageError } = await supabaseAdmin
                .storage
                .from('logos')
                .remove([connection.logo_url]);

            if (storageError) {
                console.error('Erro ao excluir imagem do storage:', storageError);
                // Não impede o sucesso da operação principal
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao excluir conexão:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// GET /connections/api/:id - Obter uma conexão específica
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Inicializar cliente Supabase e verificar bucket
        const supabaseAdmin = await initSupabaseAndBucket();

        // Buscar a conexão pelo ID
        const { data, error } = await supabaseAdmin
            .from('connections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao buscar conexão: ' + error.message },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: 'Conexão não encontrada' },
                { status: 404 }
            );
        }

        // Gerar URL pública para a imagem se for referência de storage
        let logoUrl = data.logo_url;
        if (logoUrl && logoUrl.startsWith('connections/')) {
            const { data: publicUrlData } = await supabaseAdmin
                .storage
                .from('logos')
                .getPublicUrl(logoUrl);

            logoUrl = publicUrlData.publicUrl;
        }

        // Formatar resposta
        const connection = {
            id: data.id,
            name: data.name,
            logo: logoUrl || `/logos/${data.type.toLowerCase()}.png`,
            status: data.status,
            lastSync: data.last_sync || data.created_at,
            type: data.type,
            description: data.description,
            config: data.config
        };

        return NextResponse.json(connection);
    } catch (error: any) {
        console.error('Erro ao obter detalhes da conexão:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PATCH /connections/api/:id - Atualizar status de uma conexão (apenas para admins)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Inicializar cliente Supabase e verificar bucket
        const supabaseAdmin = await initSupabaseAndBucket();

        // Obter dados da requisição
        const updateData = await request.json();

        // Validar status
        if (updateData.status && !['active', 'failed', 'pending'].includes(updateData.status)) {
            return NextResponse.json(
                { error: 'Status inválido. Valores permitidos: active, failed, pending' },
                { status: 400 }
            );
        }

        // Atualizar conexão
        const { data, error } = await supabaseAdmin
            .from('connections')
            .update({
                status: updateData.status,
                last_sync: updateData.status === 'active' ? new Date().toISOString() : undefined
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao atualizar conexão: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Erro ao atualizar conexão:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 