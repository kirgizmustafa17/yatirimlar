'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import { RefreshCw, Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpIcon, ArrowDownIcon, Trash2, ShoppingCart, Tag, Coins } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const COLORS = ['#FFD700', '#B8860B', '#DAA520']

const TYPE_LABELS = {
    'gram-altin': 'Gram Altın',
    'fiziksel-altin': 'Fiziksel Altın',
    '22-ayar-bilezik': '22 Ayar Bilezik',
    'gumus': 'Gümüş'
}

export default function InvestmentDashboard({ transactions, onDelete, prices, loadingPrices, onRefresh, refreshing }) {

    const [activeTab, setActiveTab] = React.useState('portfolio')

    const calculateMetrics = () => {
        if (!transactions || !prices) return null

        const buys = transactions.filter(t => t.transaction_type === 'buy')
        const sells = transactions.filter(t => t.transaction_type === 'sell')

        const types = ['gram-altin', 'fiziksel-altin', '22-ayar-bilezik', 'gumus']
        const typeMetrics = {}

        let totalValue = 0
        let totalCostBasis = 0
        let totalRealizedPL = 0

        types.forEach(type => {
            const typeBuys = buys.filter(t => t.type === type)
            const typeSells = sells.filter(t => t.type === type)

            const totalBought = typeBuys.reduce((sum, t) => sum + Number(t.amount), 0)
            const totalSold = typeSells.reduce((sum, t) => sum + Number(t.amount), 0)
            const currentHolding = totalBought - totalSold

            // Weighted Average Cost = Total Buy Cost / Total Buy Amount
            const totalBuyCost = typeBuys.reduce((sum, t) => sum + Number(t.amount) * Number(t.unit_price), 0)
            const wac = totalBought > 0 ? totalBuyCost / totalBought : 0

            const currentPrice = prices[type] || 0

            const currentValue = currentHolding * currentPrice
            const costBasis = currentHolding * wac
            const unrealizedPL = currentValue - costBasis
            const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0

            // Realized P/L: each sell's profit = (sell_price - WAC) * amount
            const realizedPL = typeSells.reduce((sum, t) => {
                return sum + (Number(t.unit_price) - wac) * Number(t.amount)
            }, 0)

            // Enrich individual sell transactions with profit data
            const enrichedSells = typeSells.map(t => {
                const profit = (Number(t.unit_price) - wac) * Number(t.amount)
                const profitPercent = wac > 0 ? ((Number(t.unit_price) - wac) / wac) * 100 : 0
                return { ...t, wac, profit, profitPercent }
            })

            totalValue += currentValue
            totalCostBasis += costBasis
            totalRealizedPL += realizedPL

            typeMetrics[type] = {
                totalBought,
                totalSold,
                currentHolding,
                wac,
                currentPrice,
                currentValue,
                costBasis,
                unrealizedPL,
                unrealizedPLPercent,
                realizedPL,
                buys: typeBuys,
                sells: enrichedSells
            }
        })

        const totalUnrealizedPL = totalValue - totalCostBasis
        const totalUnrealizedPLPercent = totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) * 100 : 0

        // Chart data
        const chartData = types
            .map(type => ({
                name: TYPE_LABELS[type],
                value: typeMetrics[type].currentValue
            }))
            .filter(item => item.value > 0)

        // All enriched sells for the sold tab
        const allEnrichedSells = types.flatMap(type => typeMetrics[type].sells)
            .sort((a, b) => new Date(b.date) - new Date(a.date))

        return {
            typeMetrics,
            totalValue,
            totalCostBasis,
            totalUnrealizedPL,
            totalUnrealizedPLPercent,
            totalRealizedPL,
            chartData,
            buys,
            allEnrichedSells
        }
    }

    const metrics = calculateMetrics()

    if (loadingPrices && !prices) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>

    return (
        <div className="space-y-6">
            {/* Mobile Price Header */}
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
                    <div className="grid grid-cols-2 gap-2 text-sm text-center">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <div className="text-xs text-amber-700 dark:text-amber-500 font-medium">Gram Altın</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['gram-altin']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                            {prices['gram-altin-time'] && <div className="text-[10px] text-gray-500 mt-0.5">({prices['gram-altin-time']})</div>}
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <div className="text-xs text-amber-800 dark:text-amber-600 font-medium">Fiziksel Altın</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['fiziksel-altin']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                            {prices['fiziksel-altin-time'] && <div className="text-[10px] text-gray-500 mt-0.5">({prices['fiziksel-altin-time']})</div>}
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <div className="text-xs text-amber-800 dark:text-amber-600 font-medium">22 Ayar</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['22-ayar-bilezik']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                            {prices['22-ayar-bilezik-time'] && <div className="text-[10px] text-gray-500 mt-0.5">({prices['22-ayar-bilezik-time']})</div>}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/20 rounded p-2">
                            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Gümüş</div>
                            <div className="font-bold text-gray-900 dark:text-white">{prices['gumus']?.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
                            {prices['gumus-time'] && <div className="text-[10px] text-gray-500 mt-0.5">({prices['gumus-time']})</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'portfolio'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Portföy
                </button>
                <button
                    onClick={() => setActiveTab('buys')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'buys'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Alış İşlemleri
                </button>
                <button
                    onClick={() => setActiveTab('sells')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sells'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Satış İşlemleri
                </button>
            </div>

            {/* =============== PORTFOLIO TAB =============== */}
            {metrics && activeTab === 'portfolio' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Value */}
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-5 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Wallet className="text-blue-600 dark:text-blue-400" size={20} />
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Toplam Varlık</h3>
                            </div>
                            <div className="mt-3">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {metrics.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Maliyet: {metrics.totalCostBasis.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                            </div>
                        </div>

                        {/* Unrealized P/L */}
                        <div className={`bg-gradient-to-br p-5 rounded-2xl shadow-sm border ${metrics.totalUnrealizedPL >= 0
                            ? 'from-green-50 to-white border-green-100 dark:from-green-900/20 dark:to-gray-800 dark:border-green-900/30'
                            : 'from-red-50 to-white border-red-100 dark:from-red-900/20 dark:to-gray-800 dark:border-red-900/30'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-2 rounded-lg ${metrics.totalUnrealizedPL >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {metrics.totalUnrealizedPL >= 0 ?
                                        <TrendingUp className="text-green-600 dark:text-green-400" size={20} /> :
                                        <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
                                    }
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Kağıt Kar/Zarar</h3>
                            </div>
                            <div className="mt-3">
                                <div className={`text-2xl font-bold ${metrics.totalUnrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {metrics.totalUnrealizedPL > 0 ? '+' : ''}{metrics.totalUnrealizedPL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                                <div className={`text-xs font-medium mt-1 ${metrics.totalUnrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    %{metrics.totalUnrealizedPLPercent.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Realized P/L */}
                        <div className={`bg-gradient-to-br p-5 rounded-2xl shadow-sm border ${metrics.totalRealizedPL >= 0
                            ? 'from-emerald-50 to-white border-emerald-100 dark:from-emerald-900/20 dark:to-gray-800 dark:border-emerald-900/30'
                            : 'from-red-50 to-white border-red-100 dark:from-red-900/20 dark:to-gray-800 dark:border-red-900/30'}`}>
                            <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-2 rounded-lg ${metrics.totalRealizedPL >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    <DollarSign className={`${metrics.totalRealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} size={20} />
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Gerçekleşen Kar/Zarar</h3>
                            </div>
                            <div className="mt-3">
                                <div className={`text-2xl font-bold ${metrics.totalRealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {metrics.totalRealizedPL > 0 ? '+' : ''}{metrics.totalRealizedPL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Satışlardan
                                </div>
                            </div>
                        </div>

                        {/* Holdings Summary */}
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 p-5 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Coins className="text-amber-600 dark:text-amber-400" size={20} />
                                </div>
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Varlık Miktarı</h3>
                            </div>
                            <div className="space-y-1 mt-3">
                                {Object.entries(metrics.typeMetrics).map(([type, data]) => (
                                    data.currentHolding > 0.001 && (
                                        <div key={type} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">{TYPE_LABELS[type]}:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{data.currentHolding.toFixed(2)} g</span>
                                        </div>
                                    )
                                ))}
                                {Object.values(metrics.typeMetrics).every(d => d.currentHolding <= 0.001) && (
                                    <div className="text-sm text-gray-400 dark:text-gray-500">Varlık yok</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chart + Per-Type Detail */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pie Chart */}
                        {metrics.chartData.length > 0 && (
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
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
                        )}

                        {/* Per-Type Detail Table */}
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${metrics.chartData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Varlık Detayları</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3">Tür</th>
                                            <th className="px-4 py-3">Miktar</th>
                                            <th className="px-4 py-3">Ort. Maliyet</th>
                                            <th className="px-4 py-3">Güncel Fiyat</th>
                                            <th className="px-4 py-3">Değer</th>
                                            <th className="px-4 py-3">Kar/Zarar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(metrics.typeMetrics).map(([type, data]) => (
                                            data.currentHolding > 0.001 && (
                                                <tr key={type} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{TYPE_LABELS[type]}</td>
                                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{data.currentHolding.toFixed(2)} g</td>
                                                    <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                                        {data.wac.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                    </td>
                                                    <td className="px-4 py-4 text-blue-600 dark:text-blue-400 font-medium">
                                                        {data.currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                    </td>
                                                    <td className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                                                        {data.currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                    </td>
                                                    <td className={`px-4 py-4 font-bold ${data.unrealizedPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        <div>
                                                            {data.unrealizedPL > 0 ? '+' : ''}{data.unrealizedPL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                        </div>
                                                        <div className="text-xs font-medium">
                                                            %{data.unrealizedPLPercent.toFixed(2)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        ))}
                                        {Object.values(metrics.typeMetrics).every(d => d.currentHolding <= 0.001) && (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    Portföyünüzde varlık bulunmuyor.
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

            {/* =============== BUYS TAB =============== */}
            {metrics && activeTab === 'buys' && (
                <div className="space-y-6">
                    {/* Buy Count Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 p-5 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 max-w-xs">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <ShoppingCart className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Toplam Alış</h3>
                        </div>
                        <div className="mt-3">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.buys.length} işlem</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Toplam: {metrics.buys.reduce((sum, t) => sum + Number(t.amount) * Number(t.unit_price), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                        </div>
                    </div>

                    {/* Buy Transactions Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alış İşlemleri</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3">Tür</th>
                                        <th className="px-6 py-3">Miktar</th>
                                        <th className="px-6 py-3">Birim Fiyat</th>
                                        <th className="px-6 py-3">Toplam Maliyet</th>
                                        <th className="px-6 py-3">Tarih</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.buys.map((t) => (
                                        <tr key={t.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {TYPE_LABELS[t.type] || t.type}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{Number(t.amount).toFixed(2)} g</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {Number(t.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                                                {(Number(t.amount) * Number(t.unit_price)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {format(new Date(t.date), 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => onDelete(t.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {metrics.buys.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Henüz alış işlemi bulunmuyor.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =============== SELLS TAB =============== */}
            {metrics && activeTab === 'sells' && (
                <div className="space-y-6">
                    {/* Realized P/L Summary */}
                    <div className={`bg-gradient-to-br p-5 rounded-2xl shadow-sm border max-w-sm ${metrics.totalRealizedPL >= 0
                        ? 'from-emerald-50 to-white border-emerald-100 dark:from-emerald-900/20 dark:to-gray-800 dark:border-emerald-900/30'
                        : 'from-red-50 to-white border-red-100 dark:from-red-900/20 dark:to-gray-800 dark:border-red-900/30'}`}>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg ${metrics.totalRealizedPL >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                <DollarSign className={`${metrics.totalRealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} size={20} />
                            </div>
                            <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">Toplam Gerçekleşen Kar/Zarar</h3>
                        </div>
                        <div className="mt-3">
                            <div className={`text-2xl font-bold ${metrics.totalRealizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {metrics.totalRealizedPL > 0 ? '+' : ''}{metrics.totalRealizedPL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Ağırlıklı ortalama maliyete göre
                            </div>
                        </div>
                    </div>

                    {/* Sell Transactions Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Satış İşlemleri</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kar/zarar, ağırlıklı ortalama maliyet (WAC) yöntemiyle hesaplanmaktadır.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3">Tür</th>
                                        <th className="px-4 py-3">Miktar</th>
                                        <th className="px-4 py-3">Satış Fiyatı</th>
                                        <th className="px-4 py-3">Ort. Maliyet</th>
                                        <th className="px-4 py-3">Kar/Zarar</th>
                                        <th className="px-4 py-3">Tarih</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.allEnrichedSells.map((t) => (
                                        <tr key={t.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                                                {TYPE_LABELS[t.type] || t.type}
                                            </td>
                                            <td className="px-4 py-4 text-gray-700 dark:text-gray-300">{Number(t.amount).toFixed(2)} g</td>
                                            <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                                                {Number(t.unit_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                                                {t.wac.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </td>
                                            <td className={`px-4 py-4 font-bold ${t.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                <div>
                                                    {t.profit > 0 ? '+' : ''}{t.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                                </div>
                                                <div className="text-xs font-medium">
                                                    %{t.profitPercent.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                                                {format(new Date(t.date), 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => onDelete(t.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {metrics.allEnrichedSells.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Henüz satış işlemi bulunmuyor.
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
