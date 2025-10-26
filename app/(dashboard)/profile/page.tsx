import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/groups">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Home Location</Label>
                <p className="text-sm text-slate-600 mb-2">
                  Your default location for calculating meeting points
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input id="lat" type="number" step="any" placeholder="40.7128" />
                  </div>
                  <div>
                    <Label htmlFor="lon">Longitude</Label>
                    <Input id="lon" type="number" step="any" placeholder="-74.0060" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Preferences</Label>
                <p className="text-sm text-slate-600 mb-2">
                  Set your typical mood preferences
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">Chill</Button>
                  <Button variant="outline" size="sm">Foodie</Button>
                  <Button variant="outline" size="sm">Adventurous</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
