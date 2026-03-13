import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Board } from '@/components/Board'

export default function Home() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="flex items-center justify-center h-96 text-white">Loading board...</div>}>
        <Board />
      </Suspense>
    </>
  )
}
