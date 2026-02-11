'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { sellInvestment } from '@/app/actions/investments'

export default function SellForm({ onCancel, investment, currentPrice }) {
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(investment.amount)

    // Default to current price if available, else purchase price
    const [price, setPrice] = useState(currentPrice || investment.purchase_price)

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('amount', amount)
            formData.append('selling_price', price)
            formData.append('selling_date', new Date().toISOString())

            const result = await sellInvestment(investment.id, amount, price, new Date().toISOString())
            if (result.success) {
                onCancel()
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                <p><strong>Yatırım:</strong> {investment.type === 'gram-altin' ? 'Gram Altın' : investment.type}</p>
                <p><strong>Mevcut Miktar:</strong> {investment.amount} g</p>
                <p><strong>Alış Fiyatı:</strong> {investment.purchase_price} TL</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satılacak Miktar (Gram)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    max={investment.amount}
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satış Birim Fiyatı (TL)</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                />
                {currentPrice && (
                    <p className="text-xs text-blue-600 mt-1">
                        Güncel Piyasa Fiyatı: {currentPrice.toLocaleString('tr-TR')} TL
                    </p>
                )}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                >
                    {loading ? 'İşleniyor...' : <><Check size={16} className="mr-2" /> Bozdur</>}
                </button>
            </div>
        </form>
    )
}
