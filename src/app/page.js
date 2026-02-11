import { getInvestments } from './actions';
import { getGoldPrices } from '@/lib/bigpara';
import SummaryCards from '@/components/SummaryCards';
import InvestmentTable from '@/components/InvestmentTable';
import AddInvestmentForm from '@/components/AddInvestmentForm';
import CompositionChart from '@/components/CompositionChart';
import { Coins } from 'lucide-react';

export const revalidate = 0; // Disable static caching for real-time data

export default async function Home() {
  const [investments, prices] = await Promise.all([
    getInvestments(),
    getGoldPrices()
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Coins className="text-yellow-500 w-8 h-8" />
              Yatırım Portföyü
            </h1>
            <p className="text-gray-500 mt-1">
              Altın ve Gümüş yatırımlarınızın anlık durumunu takip edin.
            </p>
          </div>
          {prices && (
            <div className="text-right text-sm text-gray-400">
              Son Güncelleme: <br />
              {new Date(prices.updateDate).toLocaleTimeString('tr-TR')}
            </div>
          )}
        </header>

        {/* Summary Cards */}
        <SummaryCards investments={investments} prices={prices} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Table */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Yatırımlarım</h2>
            <InvestmentTable investments={investments} prices={prices} />
          </div>

          {/* Sidebar: Chart & Form */}
          <div className="space-y-6">
            <CompositionChart investments={investments} prices={prices} />
            <AddInvestmentForm />
          </div>
        </div>
      </div>
    </main>
  );
}
