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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const getProfilePicture = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (data?.avatar_url) {
        const { data: image } = supabase.storage.from('profile-picture').getPublicUrl(data.avatar_url)
        setAvatarUrl(image.publicUrl)
      }
    }

    getProfilePicture()
  }, [user])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return
  
    try {
      setUploading(true)
      const filePath = `${user.id}/${selectedFile.name}`
  
      const { error: uploadError } = await supabase
        .storage
        .from('profile-picture')
        .upload(filePath, selectedFile, { upsert: true })
  
      if (uploadError) throw uploadError
  
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: filePath,
          updated_at: new Date().toISOString(),
        })
  
      const { data } = supabase
        .storage
        .from('profile-picture')
        .getPublicUrl(filePath)
  
      setAvatarUrl(data.publicUrl)
      setSelectedFile(null)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <header>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and profile information.
            </p>
          </header>

          {user ? (
            <div className="space-y-10">
              {/* Email Section */}
              <section className="space-y-2">
                <h2 className="text-lg font-medium">Email</h2>
                <p className="text-gray-700">{user.email}</p>
              </section>

              {/* Avatar Section */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full border flex items-center justify-center text-sm bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={uploading}
                    />
                    {selectedFile && (
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <p className="text-gray-500">Loading user information...</p>
          )}
        </div>
      </main>
    </div>
  )
}