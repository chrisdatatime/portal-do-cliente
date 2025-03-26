import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const userData = await request.json();

        console.log('API: Atualizando usuário:', userId);
        console.log('Dados recebidos:', userData);

        // Inicializar Supabase com chave de serviço
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Atualizar dados na tabela profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                name: userData.name || null,
                email: userData.email || null,
                company: userData.company || null,
                phone: userData.phone || null,
                role: userData.role || 'user',
                is_active: userData.is_active, // Salvar no perfil
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) {
            console.error('Erro ao atualizar perfil:', profileError);
            throw profileError;
        }

        // Se houver flag de ativo/inativo, atualizar metadados do usuário
        if (userData.is_active !== undefined) {
            try {
                // Atualizar metadados do usuário para indicar status ativo/inativo
                console.log(`${userData.is_active ? 'Ativando' : 'Desativando'} usuário...`);

                await supabaseAdmin.auth.admin.updateUserById(userId, {
                    app_metadata: {
                        disabled: !userData.is_active  // true = desativado, false = ativado
                    }
                });

                console.log('Status de ativação atualizado com sucesso');
            } catch (updateError) {
                console.error('Erro ao atualizar status do usuário:', updateError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao atualizar usuário:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao atualizar usuário' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        console.log('API: Excluindo usuário:', userId);

        // Inicializar Supabase com chave de serviço
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );

        // Excluir usuário do auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
            userId
        );

        if (authError) {
            console.error('Erro ao excluir usuário do auth:', authError);
            throw authError;
        }

        // Por segurança, também tentamos excluir diretamente da tabela profiles
        try {
            await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('id', userId);
        } catch (profileError) {
            console.warn('Aviso ao excluir perfil:', profileError);
        }

        console.log('Usuário excluído com sucesso');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao excluir usuário' },
            { status: 500 }
        );
    }
}