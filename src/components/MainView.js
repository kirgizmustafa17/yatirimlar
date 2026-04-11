'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Minus, RefreshCw } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import InvestmentDashboard from './Dashboard'
import InvestmentForm from './InvestmentForm'
import SellForm from './SellForm'
import { deleteTransaction } from '@/app/actions/investments'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function MainView({ transactions }) {
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
    const [isSellModalOpen, setIsSellModalOpen] = useState(false)
    const [prices, setPrices] = useState(null)
    const [loadingPrices, setLoadingPrices] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchPrices = async () => {
        try {
            setRefreshing(true)
            const res = await fetch('/api/prices')
            if (!res.ok) throw new Error('Fiyatlar alınamadı')
            const data = await res.json()
            setPrices(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingPrices(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchPrices()
        const interval = setInterval(fetchPrices, 60000)
        return () => clearInterval(interval)
    }, [])

    // Calculate holdings by type for SellForm validation
    const holdingsByType = useMemo(() => {
        const result = {}
        const types = ['gram-altin', 'fiziksel-altin', '22-ayar-bilezik', 'gumus']
        types.forEach(type => {
            const buys = transactions.filter(t => t.type === type && t.transaction_type === 'buy')
            const sells = transactions.filter(t => t.type === type && t.transaction_type === 'sell')
            const totalBought = buys.reduce((sum, t) => sum + Number(t.amount), 0)
            const totalSold = sells.reduce((sum, t) => sum + Number(t.amount), 0)
            const totalCost = buys.reduce((sum, t) => sum + Number(t.amount) * Number(t.unit_price), 0)
            const wac = totalBought > 0 ? totalCost / totalBought : 0
            result[type] = {
                holding: totalBought - totalSold,
                wac
            }
        })
        return result
    }, [transactions])

    const handleDelete = async (id) => {
        if (confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
            await deleteTransaction(id)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
                            Altın Takip
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            {prices && (
                                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex space-x-3">
                                        <span className="font-medium text-amber-600 dark:text-amber-500 text-xs sm:text-sm">
                                            Gr: <span className="text-gray-900 dark:text-white">{prices['gram-altin']?.toLocaleString('tr-TR')} ₺</span>
                                            {prices['gram-altin-time'] && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">({prices['gram-altin-time']})</span>}
                                        </span>
                                        <span className="font-medium text-amber-700 dark:text-amber-600 text-xs sm:text-sm">
                                            Fzk: <span className="text-gray-900 dark:text-white">{prices['fiziksel-altin']?.toLocaleString('tr-TR')} ₺</span>
                                            {prices['fiziksel-altin-time'] && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">({prices['fiziksel-altin-time']})</span>}
                                        </span>
                                        <span className="font-medium text-amber-700 dark:text-amber-600 text-xs sm:text-sm">
                                            22K: <span className="text-gray-900 dark:text-white">{prices['22-ayar-bilezik']?.toLocaleString('tr-TR')} ₺</span>
                                            {prices['22-ayar-bilezik-time'] && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">({prices['22-ayar-bilezik-time']})</span>}
                                        </span>
                                        <span className="font-medium text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                                            Ag: <span className="text-gray-900 dark:text-white">{prices['gumus']?.toLocaleString('tr-TR')} ₺</span>
                                            {prices['gumus-time'] && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">({prices['gumus-time']})</span>}
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                        <button
                                            onClick={fetchPrices}
                                            disabled={refreshing}
                                            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
                                        >
                                            <RefreshCw size={14} className="text-blue-600 dark:text-blue-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <ThemeToggle />
                            <button
                                onClick={() => setIsBuyModalOpen(true)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus size={18} className="mr-1" />
                                <span className="hidden sm:inline">Alış</span>
                            </button>
                            <button
                                onClick={() => setIsSellModalOpen(true)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                            >
                                <Minus size={18} className="mr-1" />
                                <span className="hidden sm:inline">Satış</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <InvestmentDashboard
                    transactions={transactions}
                    onDelete={handleDelete}
                    prices={prices}
                    loadingPrices={loadingPrices}
                    onRefresh={fetchPrices}
                    refreshing={refreshing}
                />
            </main>

            {/* Buy Modal */}
            <Transition show={isBuyModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsBuyModalOpen(false)}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 dark:bg-black/60 transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <TransitionChild
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="mb-4">
                                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                                                <Plus size={18} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            Yeni Alış İşlemi
                                        </DialogTitle>
                                    </div>
                                    <InvestmentForm
                                        onCancel={() => setIsBuyModalOpen(false)}
                                        currentPrices={prices}
                                    />
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Sell Modal */}
            <Transition show={isSellModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsSellModalOpen(false)}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500/75 dark:bg-black/60 transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <TransitionChild
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="mb-4">
                                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center">
                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
                                                <Minus size={18} className="text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            Yeni Satış İşlemi
                                        </DialogTitle>
                                    </div>
                                    <SellForm
                                        onCancel={() => setIsSellModalOpen(false)}
                                        holdingsByType={holdingsByType}
                                        currentPrices={prices}
                                    />
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
