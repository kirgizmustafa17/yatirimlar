import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function SummaryCards({ investments, prices }) {
    if (!prices) return null;

    let totalCost = 0;
    let totalValue = 0;

    investments.forEach(inv => {
        const currentPrice = prices[inv.type] || 0;
        const amount = parseFloat(inv.amount);
        const purchasePrice = parseFloat(inv.price);

        const cost = amount * purchasePrice;
        const value = amount * currentPrice;

        totalCost += cost;
        totalValue += value;
    });

    const profitLoss = totalValue - totalCost;
    const percentage = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : 0;
    const isProfit = profitLoss >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Varlık</h3>
                    <Wallet className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Toplam Yatırım Maliyeti</h3>
                    <DollarSign className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-500 text-sm font-medium">Kar / Zarar</h3>
                    {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                </div>
                <p className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
                <p className={`text-sm mt-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {isProfit ? '+' : ''}%{percentage}
                </p>
            </div>
        </div>
    );
}
