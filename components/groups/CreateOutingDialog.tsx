'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Loader2 } from 'lucide-react'
import { createOuting } from '@/app/(dashboard)/groups/[group_id]/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CreateOutingDialogProps {
  groupId: string
}

export function CreateOutingDialog({ groupId }: CreateOutingDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activityType, setActivityType] = useState('')
  const [mood, setMood] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('groupId', groupId)
    if (activityType) formData.append('activityType', activityType)
    if (mood) formData.append('mood', mood)

    const result = await createOuting(formData)
    setIsLoading(false)

    if (result.error) {
      toast.error('Failed to create outing', {
        description: result.error,
      })
    } else {
      toast.success('Outing created successfully')
      setOpen(false)
      setActivityType('')
      setMood('')
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Plan Outing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Plan New Outing</DialogTitle>
            <DialogDescription>
              Create a new activity or event for your group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Weekend Brunch"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What are we doing?"
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="day_trip">Day Trip</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chill">Chill</SelectItem>
                    <SelectItem value="Foodie">Foodie</SelectItem>
                    <SelectItem value="Adventurous">Adventurous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Central Park, New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & Time</Label>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Outing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
