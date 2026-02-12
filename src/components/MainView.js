'use client'

import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import InvestmentDashboard from './Dashboard'
import InvestmentForm from './InvestmentForm'
import SellForm from './SellForm'
import { deleteInvestment, sellInvestment } from '@/app/actions/investments'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export default function MainView({ investments }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [sellingInvestment, setSellingInvestment] = useState(null)
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
        const interval = setInterval(fetchPrices, 60000) // 1 min refresh
        return () => clearInterval(interval)
    }, [])

    const handleDelete = async (id) => {
        if (confirm('Bu yatırımı silmek istediğinize emin misiniz?')) {
            await deleteInvestment(id)
        }
    }

    const handleSell = (investment) => {
        setSellingInvestment(investment)
    }

    const handleSellComplete = async (id, amount, price, date) => {
        await sellInvestment(id, amount, price, date)
        setSellingInvestment(null)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
                                Altın/Gümüş Takip
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {prices && (
                                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex space-x-3">
                                        <span className="font-medium text-amber-600 dark:text-amber-500">
                                            Gr: <span className="text-gray-900 dark:text-white">{prices['gram-altin']?.toLocaleString('tr-TR')} ₺</span>
                                        </span>
                                        <span className="font-medium text-amber-700 dark:text-amber-600">
                                            22K: <span className="text-gray-900 dark:text-white">{prices['22-ayar-bilezik']?.toLocaleString('tr-TR')} ₺</span>
                                        </span>
                                        <span className="font-medium text-gray-500 dark:text-gray-400">
                                            Ag: <span className="text-gray-900 dark:text-white">{prices['gumus']?.toLocaleString('tr-TR')} ₺</span>
                                        </span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                        <span className="mr-2">
                                            {prices.updateDate ? format(new Date(prices.updateDate), 'HH:mm', { locale: tr }) : '-'}
                                        </span>
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
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus size={20} className="mr-2" />
                                <span className="hidden sm:inline">Yeni Yatırım</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <InvestmentDashboard
                    investments={investments}
                    onDelete={handleDelete}
                    onSell={handleSell}
                    prices={prices}
                    loadingPrices={loadingPrices}
                    onRefresh={fetchPrices}
                    refreshing={refreshing}
                />
            </main>

            {/* Modal */}
            <Transition show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                            Yeni Yatırım Ekle
                                        </DialogTitle>
                                    </div>
                                    <InvestmentForm
                                        onCancel={() => setIsModalOpen(false)}
                                        currentPrices={prices}
                                    />
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Sell Investment Modal */}
            <Transition show={!!sellingInvestment} as={React.Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setSellingInvestment(null)}>
                    <TransitionChild
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                                            Yatırım Bozdur / Satış
                                        </DialogTitle>
                                    </div>
                                    {sellingInvestment && (
                                        <SellForm
                                            investment={sellingInvestment}
                                            currentPrice={prices && prices[sellingInvestment.type === 'fiziksel-altin' ? 'gram-altin' : sellingInvestment.type]}
                                            onCancel={() => setSellingInvestment(null)}
                                            onComplete={handleSellComplete}
                                        />
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
