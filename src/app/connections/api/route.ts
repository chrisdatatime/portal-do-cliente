// src/app/connections/api/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface Connection {
    id: string;
    name: string;
    logo: string;
    status: 'active' | 'pending' | 'failed';
    lastSync: string | null;
    type: string;
    description: string;
    config: any;
}

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

// GET /connections/api
export async function GET() {
    try {
        // Inicializar cliente Supabase e verificar bucket
        const supabase = await initSupabaseAndBucket();

        // Buscar todas as conexões
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .order('name');

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao carregar conexões: ' + error.message },
                { status: 500 }
            );
        }

        // Formatar as conexões para o formato esperado pelo frontend
        const connections: Connection[] = await Promise.all(
            data.map(async (item) => {
                // Gerar URL pública para a imagem se for referência de storage
                let logoUrl = item.logo_url;
                if (logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('connections/')) {
                    const { data: publicUrlData } = await supabase
                        .storage
                        .from('logos')
                        .getPublicUrl(logoUrl);

                    logoUrl = publicUrlData.publicUrl;
                }

                return {
                    id: item.id,
                    name: item.name,
                    logo: logoUrl || `/logos/${item.type.toLowerCase()}.png`,
                    status: item.status,
                    lastSync: item.last_sync || item.created_at,
                    type: item.type,
                    description: item.description,
                    config: item.config
                };
            })
        );

        return NextResponse.json(connections);
    } catch (error: any) {
        console.error('Erro ao listar conexões:', error);
        return NextResponse.json(
            { error: 'Erro ao carregar conexões: ' + error.message },
            { status: 500 }
        );
    }
}

// POST /connections/api
export async function POST(request: Request) {
    try {
        // Inicializar cliente Supabase e verificar bucket
        const supabase = await initSupabaseAndBucket();

        // Obter dados do formulário
        const formData = await request.formData();

        // Campos obrigatórios
        const name = formData.get('name') as string;
        const type = formData.get('type') as string;

        // Campos opcionais
        const description = formData.get('description') as string || '';
        const configJson = formData.get('config') as string || '{}';
        const logoFile = formData.get('logo') as File || null;

        // Validar campos obrigatórios
        if (!name || !type) {
            return NextResponse.json(
                { error: 'Nome e tipo são obrigatórios' },
                { status: 400 }
            );
        }

        // Processar imagem se fornecida
        let logoPath: string | undefined = undefined;

        if (logoFile && logoFile instanceof File && logoFile.size > 0) {
            try {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `connections/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

                // Upload da imagem para o bucket 'logos'
                const { error: uploadError } = await supabase
                    .storage
                    .from('logos')
                    .upload(fileName, logoFile, {
                        contentType: logoFile.type,
                        cacheControl: '3600'
                    });

                if (uploadError) {
                    throw new Error('Erro ao processar imagem: ' + uploadError.message);
                }

                logoPath = fileName;
            } catch (error: any) {
                return NextResponse.json(
                    { error: 'Erro ao processar imagem: ' + error.message },
                    { status: 500 }
                );
            }
        }

        // Criar nova conexão
        let config = {};
        try {
            config = JSON.parse(configJson);
        } catch (e) {
            console.warn('Erro ao parsear JSON de configuração:', e);
            // Usa um objeto vazio como fallback
        }

        // Preparar objeto para inserção no banco
        const newConnection = {
            name,
            type,
            description,
            config,
            status: 'pending' as const,
            logo_url: logoPath,
            created_at: new Date().toISOString(),
            last_sync: null
        };

        // Inserir no banco de dados
        const { data, error } = await supabase
            .from('connections')
            .insert(newConnection)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao salvar conexão: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Erro ao criar conexão:', error);
        return NextResponse.json(
            { error: 'Erro ao salvar conexão: ' + error.message },
            { status: 500 }
        );
    }
}