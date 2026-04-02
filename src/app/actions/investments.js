'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
    const { data, error } = await supabase
        .from('ytrm_transactions')
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching transactions:', error)
        return []
    }

    return data
}

export async function addBuyTransaction(formData) {
    const type = formData.get('type')
    const amount = parseFloat(formData.get('amount'))
    const unit_price = parseFloat(formData.get('unit_price'))
    const date = formData.get('date')

    const { error } = await supabase
        .from('ytrm_transactions')
        .insert([{
            type,
            transaction_type: 'buy',
            amount,
            unit_price,
            date: new Date(date).toISOString()
        }])

    if (error) {
        console.error('Error adding buy transaction:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function addSellTransaction(formData) {
    const type = formData.get('type')
    const amount = parseFloat(formData.get('amount'))
    const unit_price = parseFloat(formData.get('unit_price'))
    const date = formData.get('date')

    // Validate: satılacak miktar mevcut miktarı aşamaz
    const { data: allTransactions, error: fetchError } = await supabase
        .from('ytrm_transactions')
        .select('*')
        .eq('type', type)

    if (fetchError) {
        return { success: false, error: fetchError.message }
    }

    const totalBought = allTransactions
        .filter(t => t.transaction_type === 'buy')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalSold = allTransactions
        .filter(t => t.transaction_type === 'sell')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const currentHolding = totalBought - totalSold

    if (amount > currentHolding + 0.001) {
        return { success: false, error: `Satılacak miktar mevcut miktardan (${currentHolding.toFixed(2)}g) fazla olamaz.` }
    }

    const { error } = await supabase
        .from('ytrm_transactions')
        .insert([{
            type,
            transaction_type: 'sell',
            amount,
            unit_price,
            date: new Date(date).toISOString()
        }])

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function deleteTransaction(id) {
    const { error } = await supabase
        .from('ytrm_transactions')
        .delete()
        .match({ id })

    if (error) {
        console.error('Error deleting transaction:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
