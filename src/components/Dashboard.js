'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { ArrowUpIcon, ArrowDownIcon, RefreshCw, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'

const COLORS = ['#FFD700', '#B8860B', '#E5E4E2', '#DAA520'] // Gold, 22k, Silver, Physical Gold

export default function InvestmentDashboard({ investments, onDelete, onSell, prices, loadingPrices, onRefresh, refreshing }) {

    // State for tabs
    const [activeTab, setActiveTab] = React.useState('active') // 'active' or 'sold'

    // Calculations
    const calculateMetrics = () => {
        if (!investments || !prices) return null

        // Split investments
        const activeInvestments = investments.filter(inv => inv.status !== 'sold')
        const soldInvestments = investments.filter(inv => inv.status === 'sold')

        // Metrics for Active Investments
        let totalValue = 0
        let totalCost = 0
        let totalGramGold = 0
        let totalBracelet22k = 0
        let totalSilverGrams = 0
        let totalPhysicalGold = 0

        const enrichedActiveInvestments = activeInvestments.map(inv => {
            // Map physical gold to gram gold price
            const priceKey = inv.type === 'fiziksel-altin' ? 'gram-altin' : inv.type
            const currentPrice = prices[priceKey] || 0

            const currentValue = Number(inv.amount) * currentPrice
            const cost = Number(inv.amount) * Number(inv.purchase_price)
            const profit = currentValue - cost
            const profitPercent = cost > 0 ? (profit / cost) * 100 : 0

            totalValue += currentValue
            totalCost += cost

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

            return { ...inv, currentValue, cost, profit, profitPercent, currentPrice }
        })

        const totalProfit = totalValue - totalCost
        const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

        // Metrics for Sold Investments (Realized Profit)
        let totalRealizedProfit = 0
        const enrichedSoldInvestments = soldInvestments.map(inv => {
            const sellingPrice = Number(inv.selling_price)
            const cost = Number(inv.amount) * Number(inv.purchase_price)
            const saleValue = Number(inv.amount) * sellingPrice
            const profit = saleValue - cost
            const profitPercent = cost > 0 ? (profit / cost) * 100 : 0

            totalRealizedProfit += profit

            return { ...inv, saleValue, cost, profit, profitPercent }
        })

        // Chart Data (Active Only)
        const chartData = [
            { name: 'Altın', value: totalGramGold * (prices['gram-altin'] || 0) },
            { name: '22 Ayar', value: totalBracelet22k * (prices['22-ayar-bilezik'] || 0) },
            { name: 'Gümüş', value: totalSilverGrams * (prices['gumus'] || 0) },
            { name: 'Fiziksel', value: totalPhysicalGold * (prices['gram-altin'] || 0) },
        ].filter(item => item.value > 0)

        return {
            totalValue,
            totalCost,
            totalProfit,
            totalProfitPercent,
            totalGramGold,
            totalBracelet22k,
            totalSilverGrams,
            totalPhysicalGold,
            totalRealizedProfit,
            enrichedActiveInvestments,
            enrichedSoldInvestments,
            chartData
        }
    }

    const metrics = calculateMetrics()

    if (loadingPrices && !prices) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>

    return (
        <div className="space-y-6">
            {/* Mobile Header (Refresh is in Navbar on Desktop) */}
            <div className="md:hidden flex flex-col space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-700 pb-2">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Son Güncelleme</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {prices?.updateDate ? format(new Date(prices.updateDate), 'dd MMMM HH:mm', { locale: tr }) : '-'}
                        </p>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} className="text-blue-600 dark:text-blue-400" />
                    </button>
                </div>

                {prices && (
                    <div className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <div className="text-xs text-amber-700 dark:text-amber-500 font-medium">Gram</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['gram-altin']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <div className="text-xs text-amber-800 dark:text-amber-600 font-medium">22 Ayar</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['22-ayar-bilezik']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Gümüş</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['gumus']?.toLocaleString('tr-TR')} ₺</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'active'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Aktif Yatırımlar
                </button>
                <button
                    onClick={() => setActiveTab('sold')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sold'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Geçmiş / Bozdurulanlar
                </button>
            </div>

            {metrics && activeTab === 'active' && (
                <>
                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Value */}
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium">Toplam Varlık</h3>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {metrics.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Maliyet: {metrics.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                            </div>
                        </div>

                        {/* Profit/Loss */}
                        <div className={`bg-gradient-to-br p-6 rounded-2xl shadow-sm border ${metrics.totalProfit >= 0
                            ? 'from-green-50 to-white border-green-100 dark:from-green-900/20 dark:to-gray-800 dark:border-green-900/30'
                            : 'from-red-50 to-white border-red-100 dark:from-red-900/20 dark:to-gray-800 dark:border-red-900/30'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-2 rounded-lg ${metrics.totalProfit >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {metrics.totalProfit >= 0 ?
                                        <TrendingUp className="text-green-600 dark:text-green-400" size={24} /> :
                                        <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
                                    }
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium">Toplam Kar/Zarar</h3>
                            </div>
                            <div className="mt-4">
                                <div className={`text-3xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {metrics.totalProfit > 0 ? '+' : ''}{metrics.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                                <div className={`text-sm font-medium mt-1 ${metrics.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    %{metrics.totalProfitPercent.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Holdings */}
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <div className="font-bold text-amber-700 dark:text-amber-500 text-lg">Au/Ag</div>
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium">Varlık Miktarı</h3>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Gram Altın:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{metrics.totalGramGold.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Fiziksel Altın:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{metrics.totalPhysicalGold.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">22 Ayar:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{metrics.totalBracelet22k.toFixed(2)} g</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Gümüş:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{metrics.totalSilverGrams.toFixed(2)} g</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts & List Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Portföy Dağılımı</h3>
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
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value) => `${value.toLocaleString('tr-TR')} ₺`}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend wrapperStyle={{ color: 'var(--color-gray-500)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white dark:bg-gray-800 p-0 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Yatırım Geçmişi</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3">Tür</th>
                                            <th className="px-6 py-3">Miktar</th>
                                            <th className="px-6 py-3">Alış (Birim)</th>
                                            <th className="px-6 py-3">Maliyet</th>
                                            <th className="px-6 py-3">Kar/Zarar</th>
                                            <th className="px-6 py-3">Tarih</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.enrichedActiveInvestments.map((inv) => (
                                            <tr key={inv.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {inv.type === 'gram-altin' ? 'Gram Altın' :
                                                        inv.type === 'gumus' ? 'Gümüş' :
                                                            inv.type === 'fiziksel-altin' ? 'Fiziksel Altın' : '22 Ayar Bilezik'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{inv.amount} g</td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                    {inv.purchase_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                                                    {inv.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                                </td>
                                                <td className={`px-6 py-4 font-bold ${inv.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    %{inv.profitPercent.toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {format(new Date(inv.purchase_date), 'dd.MM.yyyy')}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => onSell(inv)}
                                                            className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                                            title="Bozdur / Sat"
                                                        >
                                                            <DollarSign size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDelete(inv.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {metrics.enrichedActiveInvestments.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    Henüz yatırımınız bulunmuyor.
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

            {metrics && activeTab === 'sold' && (
                <div className="space-y-6">
                    {/* Sold Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 max-w-sm">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-300 font-medium">Toplam Gerçekleşen Kar</h3>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                +{metrics.totalRealizedProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    {/* Sold List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bozdurulan Yatırımlar</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3">Tür</th>
                                        <th className="px-6 py-3">Miktar</th>
                                        <th className="px-6 py-3">Alış Fiyatı</th>
                                        <th className="px-6 py-3">Satış Fiyatı</th>
                                        <th className="px-6 py-3">Gerçekleşen Kar</th>
                                        <th className="px-6 py-3">Satış Tarihi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.enrichedSoldInvestments.map((inv) => (
                                        <tr key={inv.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {inv.type === 'gram-altin' ? 'Gram Altın' :
                                                    inv.type === 'gumus' ? 'Gümüş' :
                                                        inv.type === 'fiziksel-altin' ? 'Fiziksel Altın' : '22 Ayar Bilezik'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{inv.amount} g</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {inv.purchase_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {Number(inv.selling_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${inv.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {inv.profit > 0 ? '+' : ''}{inv.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {inv.selling_date ? format(new Date(inv.selling_date), 'dd.MM.yyyy HH:mm') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {metrics.enrichedSoldInvestments.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Henüz bozdurulan yatırım bulunmuyor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
