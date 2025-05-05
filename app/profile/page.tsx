'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user } = useUser()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const getProfilePicture = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (data?.avatar_url) {
        const { data: image } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url)
        setAvatarUrl(image.publicUrl)
      }
    }

    getProfilePicture()
  }, [user])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file || !user) return

      const filePath = `${user.id}/${file.name}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Update avatar_url in the DB
      await supabase.from('profiles').upsert({
        id: user.id,
        avatar_url: filePath,
      })

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
        {user ? (
          <div className="space-y-4">
            <p><strong>Email:</strong> {user.email}</p>

            <div>
              <p className="font-semibold">Profile Picture</p>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover mb-2" />
              ) : (
                <p>No profile picture uploaded.</p>
              )}

              <Input type="file" onChange={handleUpload} accept="image/*" disabled={uploading} />
              {uploading && <p>Uploading...</p>}
            </div>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>
    </div>
  )
}