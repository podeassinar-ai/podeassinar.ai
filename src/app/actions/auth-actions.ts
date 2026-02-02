'use server';

import { createClient } from '@infrastructure/database/supabase-server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(email: string, password: string, redirectTo: string = '/') {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect(redirectTo);
}

export async function signupAction(email: string, password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: email.split('@')[0],
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true, message: 'Conta criada! Verifique seu email ou faça login.' };
}

export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
}
