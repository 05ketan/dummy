import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { PlanPalChat } from '@/components/groups/PlanPalChat'

export default async function GroupDetailPage({
  params,
}: {
  params: { group_id: string }
}) {
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
        <div className="mb-6">
          <Link href="/groups">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Weekend Warriors</h1>
          <p className="text-slate-600 mt-1">5 members</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PlanPalChat groupId={params.group_id} />

            <Card>
              <CardHeader>
                <CardTitle>Current Poll</CardTitle>
                <CardDescription>Vote for your preferred option</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">No active polls</p>
                <Button className="mt-4">Create New Poll</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Planned outings for this group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Dinner at Downtown</p>
                      <p className="text-sm text-slate-600">Saturday, 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <span className="text-sm">Alice Johnson</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Plan Outing
                </Button>
                <Button className="w-full" variant="outline">
                  Invite Members
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
