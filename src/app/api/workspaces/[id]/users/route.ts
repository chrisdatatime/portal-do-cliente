import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
const initSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
};

// POST /api/workspaces/:id/users - Convidar usuário para o workspace
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = initSupabase();
        const workspaceId = params.id;
        const { email, role } = await request.json();

        // Verificar se o usuário tem acesso ao workspace
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é owner ou admin
        const { data: userRole } = await supabase
            .from('workspace_users')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', session.user.id)
            .single();

        if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
            return NextResponse.json(
                { error: 'Permissão negada' },
                { status: 403 }
            );
        }

        // Verificar se o usuário já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        let userId = existingUser?.id;

        // Se o usuário não existe, criar um novo
        if (!userId) {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: { invited_to: workspaceId }
            });

            if (createError) {
                return NextResponse.json(
                    { error: 'Erro ao criar usuário' },
                    { status: 500 }
                );
            }

            userId = newUser.user.id;
        }

        // Adicionar usuário ao workspace
        const { error: inviteError } = await supabase
            .from('workspace_users')
            .insert({
                workspace_id: workspaceId,
                user_id: userId,
                role: role || 'user',
                status: 'invited'
            });

        if (inviteError) {
            return NextResponse.json(
                { error: 'Erro ao adicionar usuário ao workspace' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Erro ao convidar usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE /api/workspaces/:id/users/:userId - Remover usuário do workspace
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const supabase = initSupabase();
        const { id: workspaceId, userId } = params;

        // Verificar se o usuário tem acesso ao workspace
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é owner ou admin
        const { data: userRole } = await supabase
            .from('workspace_users')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', session.user.id)
            .single();

        if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
            return NextResponse.json(
                { error: 'Permissão negada' },
                { status: 403 }
            );
        }

        // Verificar se o usuário a ser removido é o owner
        const { data: targetUser } = await supabase
            .from('workspace_users')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .single();

        if (targetUser?.role === 'owner') {
            return NextResponse.json(
                { error: 'Não é possível remover o proprietário do workspace' },
                { status: 403 }
            );
        }

        // Remover usuário do workspace
        const { error: removeError } = await supabase
            .from('workspace_users')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId);

        if (removeError) {
            return NextResponse.json(
                { error: 'Erro ao remover usuário do workspace' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Erro ao remover usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PATCH /api/workspaces/:id/users/:userId - Atualizar papel do usuário
export async function PATCH(
    request: Request,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const supabase = initSupabase();
        const { id: workspaceId, userId } = params;
        const { role } = await request.json();

        // Verificar se o usuário tem acesso ao workspace
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Usuário não autenticado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é owner
        const { data: userRole } = await supabase
            .from('workspace_users')
            .select('role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', session.user.id)
            .single();

        if (!userRole || userRole.role !== 'owner') {
            return NextResponse.json(
                { error: 'Apenas o proprietário pode alterar papéis' },
                { status: 403 }
            );
        }

        // Atualizar papel do usuário
        const { error: updateError } = await supabase
            .from('workspace_users')
            .update({ role })
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId);

        if (updateError) {
            return NextResponse.json(
                { error: 'Erro ao atualizar papel do usuário' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Erro ao atualizar papel do usuário:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 