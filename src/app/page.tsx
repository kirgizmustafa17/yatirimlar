
import { getInvestments } from '@/app/actions/investments'
import MainView from '@/components/MainView'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const investments = await getInvestments()

  return <MainView investments={investments} />
}
