'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import InvestmentDashboard from './Dashboard'
import InvestmentForm from './InvestmentForm'
import { deleteInvestment } from '@/app/actions/investments'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

export default function MainView({ investments }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDelete = async (id) => {
        if (confirm('Bu yatırımı silmek istediğinize emin misiniz?')) {
            await deleteInvestment(id)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">
                                Altın/Gümüş Takip
                            </span>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus size={20} className="mr-2" />
                                Yeni Yatırım
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <InvestmentDashboard
                    investments={investments}
                    onDelete={handleDelete}
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
                                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                    <div className="mb-4">
                                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            Yeni Yatırım Ekle
                                        </DialogTitle>
                                    </div>
                                    <InvestmentForm onCancel={() => setIsModalOpen(false)} />
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
