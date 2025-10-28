'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/app/(dashboard)/profile/actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormProps {
  profile: {
    full_name: string | null
    username: string | null
    home_latitude: number | null
    home_longitude: number | null
    home_address: string | null
    default_mood: string | null
  } | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMood, setSelectedMood] = useState(profile?.default_mood || '')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    setIsLoading(false)

    if (result.error) {
      toast.error('Failed to update profile', {
        description: result.error,
      })
    } else {
      toast.success('Profile updated successfully')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          defaultValue={profile?.full_name || ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          defaultValue={profile?.username || ''}
        />
      </div>

      <div className="space-y-2">
        <Label>Home Location</Label>
        <p className="text-sm text-slate-600 mb-2">
          Your default location for calculating meeting points
        </p>
        <div className="space-y-4">
          <Textarea
            id="homeAddress"
            name="homeAddress"
            placeholder="123 Main St, New York, NY 10001"
            defaultValue={profile?.home_address || ''}
            className="min-h-[60px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeLatitude">Latitude</Label>
              <Input
                id="homeLatitude"
                name="homeLatitude"
                type="number"
                step="any"
                placeholder="40.7128"
                defaultValue={profile?.home_latitude || ''}
              />
            </div>
            <div>
              <Label htmlFor="homeLongitude">Longitude</Label>
              <Input
                id="homeLongitude"
                name="homeLongitude"
                type="number"
                step="any"
                placeholder="-74.0060"
                defaultValue={profile?.home_longitude || ''}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Default Mood Preference</Label>
        <p className="text-sm text-slate-600 mb-2">
          Choose your typical mood for activity recommendations
        </p>
        <input type="hidden" name="defaultMood" value={selectedMood} />
        <div className="flex gap-2 flex-wrap">
          {['Chill', 'Foodie', 'Adventurous'].map((mood) => (
            <Button
              key={mood}
              type="button"
              variant={selectedMood === mood ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMood(mood)}
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
