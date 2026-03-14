import { Header } from '@/components/Header'
import { Board } from '@/components/Board'

export const metadata = {
  title: 'Collaborative Todo Board',
  description: 'Real-time collaborative task management with Supabase',
}

export default function Home() {
  return (
    <>
      <Header />
      <Board />
    </>
  )
}
