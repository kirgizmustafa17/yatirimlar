'use client';

import { useState } from 'react';
import { addInvestment } from '@/app/actions';
import { Plus } from 'lucide-react';

export default function AddInvestmentForm() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        await addInvestment(formData);
        setLoading(false);
        e.target.reset();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Yeni Yatırım Ekle
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yatırım Türü</label>
                    <select
                        name="type"
                        required
                        className="w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="gram-altin">Gram Altın (24 Ayar)</option>
                        <option value="22-ayar-bilezik">Bilezik (22 Ayar)</option>
                        <option value="gumus">Gümüş</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miktar (Gram)</label>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        placeholder="Örn: 10.5"
                        className="w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alış Fiyatı (Birim)</label>
                    <input
                        type="number"
                        name="price"
                        step="0.01"
                        required
                        placeholder="Örn: 2250.00"
                        className="w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alış Tarihi</label>
                    <input
                        type="date"
                        name="purchase_date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-lg border-gray-200 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Ekleniyor...' : 'Yatırımı Kaydet'}
                </button>
            </form>
        </div>
    );
}
