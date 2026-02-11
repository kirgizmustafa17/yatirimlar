'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getInvestments() {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('purchase_date', { ascending: false })

    if (error) {
        console.error('Error fetching investments:', error)
        return []
    }

    return data
}

export async function addInvestment(formData) {
    const type = formData.get('type')
    const amount = parseFloat(formData.get('amount'))
    const purchase_price = parseFloat(formData.get('purchase_price'))
    const purchase_date = formData.get('purchase_date')

    const { error } = await supabase
        .from('investments')
        .insert([
            {
                type,
                amount,
                purchase_price,
                purchase_date: new Date(purchase_date).toISOString(),
            },
        ])

    if (error) {
        console.error('Error adding investment:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteInvestment(id) {
    const { error } = await supabase
        .from('investments')
        .delete()
        .match({ id })

    if (error) {
        console.error('Error deleting investment:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
