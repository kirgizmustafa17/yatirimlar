'use client';

import { Trash2 } from 'lucide-react';
import { deleteInvestment } from '@/app/actions';

export default function InvestmentTable({ investments, prices }) {
    const handleDelete = async (id) => {
        if (confirm('Bu yatırımı silmek istediğinize emin misiniz?')) {
            await deleteInvestment(id);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Tür</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Miktar</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Alış Fiyatı</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Güncel Fiyat</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Değer</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Kar/Zarar</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Tarih</th>
                            <th className="px-6 py-4 font-medium text-gray-500">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {investments.map((inv) => {
                            const currentPrice = prices ? prices[inv.type] : 0;
                            const amount = parseFloat(inv.amount);
                            const purchasePrice = parseFloat(inv.price);

                            const value = amount * currentPrice;
                            const cost = amount * purchasePrice;
                            const profit = value - cost;
                            const isProfit = profit >= 0;

                            return (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {inv.type === 'gram-altin' && 'Gram Altın (24k)'}
                                        {inv.type === '22-ayar-bilezik' && 'Bilezik (22k)'}
                                        {inv.type === 'gumus' && 'Gümüş'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{inv.amount} g</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {inv.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {currentPrice ? currentPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </td>
                                    <td className={`px-6 py-4 font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                        {profit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(inv.purchase_date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(inv.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {investments.length === 0 && (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                    Henüz yatırım kaydı bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
