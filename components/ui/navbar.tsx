'use client'

import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const { user } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    } else {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="w-full px-4 py-3 border-b flex justify-between items-center">
      <a href="/" className="text-xl font-bold hover:opacity-80">Workout-Tracker!</a>
      {user && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/profile')}>
            Profile
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      )}
    </nav>
  )
}