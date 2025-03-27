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
      return NextResponse.json(
        { error: 'Erro ao buscar empresas: ' + error.message },
        { status: 500 }
      );
    }

    // Contar usuários por empresa
    const { data: userCounts, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('company_id, count')
      .eq('is_active', true)
      .group('company_id');

    if (countError) {
      console.error('Erro ao contar usuários:', countError);
    }

    // Mapear contagens para as empresas
    const companiesWithCounts = companies.map(company => {
      const countObj = userCounts?.find(uc => uc.company_id === company.id);
      return {
        ...company,
        user_count: countObj ? parseInt(countObj.count) : 0
      };
    });

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
    // Verificar se o usuário é administrador
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Permissão negada. Apenas administradores podem criar empresas.' },
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