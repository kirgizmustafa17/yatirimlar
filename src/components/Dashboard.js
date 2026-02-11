'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, RefreshCw, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const COLORS = ['#FFD700', '#B8860B', '#E5E4E2', '#DAA520'] // Gold, 22k, Silver, Physical Gold (Darker Gold)

export default function InvestmentDashboard({ investments, onDelete, prices, loadingPrices, onRefresh, refreshing }) {

    // Calculations
    const calculateMetrics = () => {
        if (!prices || !investments) return null

        let totalInvested = 0
        let totalCurrentValue = 0
        let totalGramGold = 0
        let totalBracelet22k = 0
        let totalSilverGrams = 0
        let totalPhysicalGold = 0

        const enrichedInvestments = investments.map(inv => {
            // Map physical gold to gram gold price
            const priceKey = inv.type === 'fiziksel-altin' ? 'gram-altin' : inv.type
            const currentPrice = prices[priceKey] || 0

            const cost = inv.amount * inv.purchase_price
            const value = inv.amount * currentPrice
            const profit = value - cost
            const profitPercent = cost > 0 ? (profit / cost) * 100 : 0

            totalInvested += cost
            totalCurrentValue += value

            // Separate quantities
            if (inv.type === 'gram-altin') {
                totalGramGold += Number(inv.amount)
            } else if (inv.type === '22-ayar-bilezik') {
                totalBracelet22k += Number(inv.amount)
            } else if (inv.type === 'gumus') {
                totalSilverGrams += Number(inv.amount)
            } else if (inv.type === 'fiziksel-altin') {
                totalPhysicalGold += Number(inv.amount)
            }

            return { ...inv, currentPrice, value, profit, profitPercent, displayType: inv.type }
        })

        const totalProfit = totalCurrentValue - totalInvested
        const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

        // Chart Data
        const chartData = [
            { name: 'Gram Altın', value: enrolledValue(enrichedInvestments, 'gram-altin') },
            { name: '22 Ayar Bilezik', value: enrolledValue(enrichedInvestments, '22-ayar-bilezik') },
            { name: 'Gümüş', value: enrolledValue(enrichedInvestments, 'gumus') },
            { name: 'Fiziksel Altın', value: enrolledValue(enrichedInvestments, 'fiziksel-altin') },
        ].filter(d => d.value > 0)

        return {
            totalInvested,
            totalCurrentValue,
            totalProfit,
            totalProfitPercent,
            totalGramGold,
            totalBracelet22k,
            totalSilverGrams,
            totalPhysicalGold,
            enrichedInvestments,
            chartData
        }
    }

    const enrolledValue = (items, type) => {
        return items.filter(i => i.type === type).reduce((sum, i) => sum + i.value, 0)
    }

    const metrics = calculateMetrics()

    if (loadingPrices && !prices) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>

    return (
        <div className="space-y-6">
            {/* Mobile Header (Refresh is in Navbar on Desktop) */}
            <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <p className="text-sm text-gray-500">Son Güncelleme</p>
                    <p className="font-medium text-gray-900">
                        {prices?.updateDate ? format(new Date(prices.updateDate), 'dd MMMM HH:mm', { locale: tr }) : '-'}
                    </p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-all ${refreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={20} className="text-blue-600" />
                </button>
            </div>

            {metrics && (
                <>
                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Value */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-sm border border-blue-100">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Wallet className="text-blue-600" size={24} />
                                </div>
                                <h3 className="text-gray-600 font-medium">Toplam Varlık</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {metrics.totalCurrentValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Yatırılan: {metrics.totalInvested.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                        </div>

                        {/* Profit/Loss */}
                        <div className={`bg-gradient-to-br p-6 rounded-2xl shadow-sm border ${metrics.totalProfit >= 0 ? 'from-green-50 to-white border-green-100' : 'from-red-50 to-white border-red-100'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-2 rounded-lg ${metrics.totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {metrics.totalProfit >= 0 ?
                                        <TrendingUp className="text-green-600" size={24} /> :
                                        <TrendingDown className="text-red-600" size={24} />
                                    }
                                </div>
                                <h3 className="text-gray-600 font-medium">Toplam Kar/Zarar</h3>
                            </div>
                            <p className={`text-3xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metrics.totalProfit >= 0 ? '+' : ''}
                                {metrics.totalProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                            <p className={`text-sm font-medium mt-1 ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                %{metrics.totalProfitPercent.toFixed(2)}
                            </p>
                        </div>

                        {/* Holdings */}
                        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-2xl shadow-sm border border-amber-100">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <div className="font-bold text-amber-700 text-lg">Au/Ag</div>
                                </div>
                                <h3 className="text-gray-600 font-medium">Varlık Miktarı</h3>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Gram Altın:</span>
                                    <span className="font-bold text-gray-900">{metrics.totalGramGold.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Fiziksel Altın:</span>
                                    <span className="font-bold text-gray-900">{metrics.totalPhysicalGold.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">22 Ayar:</span>
                                    <span className="font-bold text-gray-900">{metrics.totalBracelet22k.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Gümüş:</span>
                                    <span className="font-bold text-gray-900">{metrics.totalSilverGrams.toFixed(2)} g</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts & List Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Portföy Dağılımı</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics.chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {metrics.chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white p-0 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Yatırım Geçmişi</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Tür</th>
                                            <th className="px-6 py-3">Miktar</th>
                                            <th className="px-6 py-3">Alış (Birim)</th>
                                            <th className="px-6 py-3">Güncel</th>
                                            <th className="px-6 py-3">Kar/Zarar</th>
                                            <th className="px-6 py-3">Tarih</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.enrichedInvestments.map((inv) => (
                                            <tr key={inv.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {inv.type === 'gram-altin' ? 'Gram Altın' :
                                                        inv.type === 'gumus' ? 'Gümüş' :
                                                            inv.type === 'fiziksel-altin' ? 'Fiziksel Altın' : '22 Ayar Bilezik'}
                                                </td>
                                                <td className="px-6 py-4">{inv.amount} g</td>
                                                <td className="px-6 py-4">
                                                    {inv.purchase_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                                </td>
                                                <td className="px-6 py-4">
                                                    {inv.currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${inv.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    %{inv.profitPercent.toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {format(new Date(inv.purchase_date), 'dd.MM.yyyy')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => onDelete(inv.id)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        Sil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {metrics.enrichedInvestments.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                    Henüz yatırım kaydı bulunmuyor.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
