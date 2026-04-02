
import { getTransactions } from '@/app/actions/investments'
import MainView from '@/components/MainView'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const transactions = await getTransactions()

  return <MainView transactions={transactions} />
}
