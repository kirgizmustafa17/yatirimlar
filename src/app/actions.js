'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getInvestments() {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('purchase_date', { ascending: false });

    if (error) {
        console.error('Error fetching investments:', error);
        return [];
    }

    return data;
}

export async function addInvestment(formData) {
    const type = formData.get('type');
    const amount = parseFloat(formData.get('amount'));
    const price = parseFloat(formData.get('price'));
    // purchase_date defaults to now() in DB, or we can let user pick. 
    // For now let's keep it simple as "just bought" or we can parse a date if added to form.
    // The prompt says "t tarihinde ... aldım", so ideally we should allow date selection.
    // I will add date support if the form sends it, otherwise default.
    // Let's check formData for 'purchase_date'
    const purchaseDate = formData.get('purchase_date') || new Date().toISOString();

    const { error } = await supabase
        .from('investments')
        .insert([
            { type, amount, price, purchase_date: purchaseDate }
        ]);

    if (error) {
        console.error('Error adding investment:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}

export async function deleteInvestment(id) {
    const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting investment:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
}
