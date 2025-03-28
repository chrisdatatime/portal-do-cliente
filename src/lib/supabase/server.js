import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createClient(cookieStore) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Credenciais do Supabase não encontradas nas variáveis de ambiente.');
    }

    return createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
} 