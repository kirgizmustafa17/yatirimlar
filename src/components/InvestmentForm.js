'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { addInvestment } from '@/app/actions/investments'

export default function InvestmentForm({ onCancel }) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.target)

        try {
            await addInvestment(formData)
            onCancel() // Close modal/form
        } catch (error) {
            console.error(error)
            alert('Hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yatırım Türü</label>
                <select
                    name="type"
                    required
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                >
                    <option value="gram-altin">Gram Altın (24 Ayar)</option>
                    <option value="22-ayar-bilezik">22 Ayar Bilezik</option>
                    <option value="gumus">Gümüş</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miktar (Gram)</label>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        placeholder="Örn: 10.5"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alış Birim Fiyatı (TL)</label>
                    <input
                        type="number"
                        name="purchase_price"
                        step="0.01"
                        required
                        placeholder="Örn: 2450.00"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alış Tarihi</label>
                <input
                    type="datetime-local"
                    name="purchase_date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-gray-50 border"
                />
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
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                    {loading ? 'Kaydediliyor...' : <><Plus size={16} className="mr-2" /> Ekle</>}
                </button>
            </div>
        </form>
    )
}
