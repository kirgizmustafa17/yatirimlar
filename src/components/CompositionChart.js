'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#FFBB28', '#FF8042', '#00C49F', '#0088FE'];

export default function CompositionChart({ investments, prices }) {
    if (!prices || investments.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center text-gray-400">
                Veri Yok
            </div>
        )
    }

    // Group by type
    const dataMap = {};
    investments.forEach(inv => {
        const currentPrice = prices[inv.type] || 0;
        const value = inv.amount * currentPrice;

        if (dataMap[inv.type]) {
            dataMap[inv.type] += value;
        } else {
            dataMap[inv.type] = value;
        }
    });

    const data = Object.keys(dataMap).map(type => {
        let name = type;
        if (type === 'gram-altin') name = 'Gram Altın';
        if (type === '22-ayar-bilezik') name = 'Bilezik (22k)';
        if (type === 'gumus') name = 'Gümüş';

        return {
            name,
            value: dataMap[type]
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portföy Dağılımı</h3>
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
