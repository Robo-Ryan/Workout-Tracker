// app/login/page.tsx
'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function LoginPage() {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            router.push('/') // go to home after login
          }
        })
      }, [])
      
    return (
    <div className="flex justify-center items-center h-screen">
      <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
    </div>
  )
}

