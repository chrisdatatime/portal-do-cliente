// src/app/api/companies/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/simple-auth';

export const dynamic = 'force-dynamic';

// GET /api/companies - Listar todas as empresas
export async function GET(request: Request) {
    try {
        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Buscar todas as empresas
        const { data: companies, error } = await supabaseAdmin
            .from('companies')
            .select('*')
            .order('name');

        if (error) {
            console.error('Erro ao buscar empresas:', error);
            return NextResponse.json(
                { error: 'Erro ao buscar empresas: ' + error.message },
                { status: 500 }
            );
        }

        // Abordagem alternativa: buscar contagem de usuários para cada empresa
        const companiesWithCounts = [...companies];

        for (const company of companiesWithCounts) {
            // Buscar contagem de usuários para esta empresa
            const { count, error: countError } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('company_id', company.id)
                .eq('is_active', true);

            if (countError) {
                console.error('Erro ao contar usuários para empresa:', company.id, countError);
            }

            company.user_count = count || 0;
        }

        return NextResponse.json(companiesWithCounts);
    } catch (error: any) {
        console.error('Erro ao listar empresas:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// POST /api/companies - Criar nova empresa
export async function POST(request: Request) {
    try {
        // Inicializar cliente Supabase
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.SUPABASE_SERVICE_ROLE_KEY || '',
            { auth: { persistSession: false } }
        );

        // Obter dados da requisição
        const companyData = await request.json();

        // Validar dados
        if (!companyData.name) {
            return NextResponse.json(
                { error: 'Nome da empresa é obrigatório' },
                { status: 400 }
            );
        }

        // Inserir nova empresa
        const { data, error } = await supabaseAdmin
            .from('companies')
            .insert({
                name: companyData.name,
                description: companyData.description || null,
                logo_url: companyData.logo || null,
            })
            .select('*')
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Erro ao criar empresa: ' + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao criar empresa:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}