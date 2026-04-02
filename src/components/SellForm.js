'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Check } from 'lucide-react'
import { addSellTransaction } from '@/app/actions/investments'

const TYPE_LABELS = {
    'gram-altin': 'Gram Altın (24 Ayar)',
    'fiziksel-altin': 'Fiziksel Altın (24 Ayar - Elden)',
    '22-ayar-bilezik': '22 Ayar Bilezik',
    'gumus': 'Gümüş'
}

export default function SellForm({ onCancel, holdingsByType, currentPrices }) {
    const [loading, setLoading] = useState(false)
    const [selectedType, setSelectedType] = useState('')

    // Filter types that actually have holdings > 0
    const availableTypes = useMemo(() => {
        return Object.entries(holdingsByType)
            .filter(([_, data]) => data.holding > 0.001)
            .map(([type, data]) => ({ type, ...data }))
    }, [holdingsByType])

    // Set default selected type
    useEffect(() => {
        if (availableTypes.length > 0 && !selectedType) {
            setSelectedType(availableTypes[0].type)
        }
    }, [availableTypes, selectedType])

    const selectedHolding = holdingsByType[selectedType]
    const priceKey = selectedType === 'fiziksel-altin' ? 'gram-altin' : selectedType
    const currentMarketPrice = currentPrices?.[priceKey]

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(event.target)
            const result = await addSellTransaction(formData)
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

    if (availableTypes.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">📦</div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Satılacak varlık bulunmuyor.</p>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                >
                    Kapat
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Varlık Türü</label>
                <select
                    name="type"
                    required
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border"
                >
                    {availableTypes.map(({ type }) => (
                        <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                    ))}
                </select>
            </div>

            {/* Info Box */}
            {selectedHolding && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm space-y-1 border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Mevcut Miktar:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedHolding.holding.toFixed(2)} g</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Ort. Maliyet (WAC):</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{selectedHolding.wac.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    {currentMarketPrice && (
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Güncel Piyasa:</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{currentMarketPrice.toLocaleString('tr-TR')} TL</span>
                        </div>
                    )}
                </div>
            )}

            {/* Amount & Price */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Satış Miktarı (Gram)</label>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        max={selectedHolding?.holding || 0}
                        required
                        placeholder="Örn: 5.00"
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Satış Birim Fiyatı (TL)</label>
                    <input
                        type="number"
                        name="unit_price"
                        step="0.01"
                        required
                        defaultValue={currentMarketPrice || ''}
                        placeholder="Örn: 2600.00"
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Satış Tarihi</label>
                <input
                    type="datetime-local"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 bg-gray-50 dark:bg-gray-700 dark:text-white border"
                />
            </div>

            {/* Estimated Profit Preview */}
            {selectedHolding && selectedHolding.wac > 0 && currentMarketPrice && (
                <div className={`p-3 rounded-lg text-sm border ${currentMarketPrice >= selectedHolding.wac
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Tahmini Kar/Zarar (gram başına):</span>
                        <span className={`font-bold ${currentMarketPrice >= selectedHolding.wac
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {currentMarketPrice >= selectedHolding.wac ? '+' : ''}
                            {(currentMarketPrice - selectedHolding.wac).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center"
                >
                    {loading ? 'İşleniyor...' : <><Check size={16} className="mr-2" /> Satış Yap</>}
                </button>
            </div>
        </form>
    )
}
