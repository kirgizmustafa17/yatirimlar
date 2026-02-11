'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getInvestments() {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('status', 'active') // Filter by active investments
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
                status: 'active'
            },
        ])

    if (error) {
        console.error('Error adding investment:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}

export async function sellInvestment(id, sellAmount, sellingPrice, sellingDate) {
    const { data: investment, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !investment) {
        return { success: false, error: 'Investment not found' }
    }

    const currentAmount = parseFloat(investment.amount)
    const sellAmountFloat = parseFloat(sellAmount)
    const sellingPriceFloat = parseFloat(sellingPrice)

    if (sellAmountFloat > currentAmount) {
        return { success: false, error: 'Satılacak miktar mevcut miktardan fazla olamaz.' }
    }

    // If fully sold
    if (Math.abs(currentAmount - sellAmountFloat) < 0.001) {
        const { error } = await supabase
            .from('investments')
            .update({
                status: 'sold',
                selling_price: sellingPriceFloat,
                selling_date: new Date(sellingDate).toISOString()
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }
    } else {
        // Partial Sale: Update original (remain active) and create new (sold)
        const remainingAmount = currentAmount - sellAmountFloat

        // 1. Update original to remaining amount
        const { error: updateError } = await supabase
            .from('investments')
            .update({ amount: remainingAmount })
            .eq('id', id)

        if (updateError) return { success: false, error: updateError.message }

        // 2. Insert new sold record
        const { error: insertError } = await supabase
            .from('investments')
            .insert([{
                type: investment.type,
                amount: sellAmountFloat,
                purchase_price: investment.purchase_price,
                purchase_date: investment.purchase_date,
                selling_price: sellingPriceFloat,
                selling_date: new Date(sellingDate).toISOString(),
                status: 'sold'
            }])

        if (insertError) return { success: false, error: insertError.message }
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
