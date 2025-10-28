import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { PlanPalChat } from '@/components/groups/PlanPalChat'
import { PollComponent } from '@/components/groups/PollComponent'
import { CreatePollDialog } from '@/components/groups/CreatePollDialog'
import { CreateOutingDialog } from '@/components/groups/CreateOutingDialog'
import { format } from 'date-fns'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ group_id: string }>
}) {
  const { group_id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: group } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      description,
      group_members (
        user_id,
        role,
        profiles (
          full_name,
          username
        )
      )
    `)
    .eq('id', group_id)
    .single()

  if (!group) {
    redirect('/groups')
  }

  const { data: activePolls } = await supabase
    .from('polls')
    .select(`
      id,
      title,
      description,
      status,
      poll_options (
        id,
        option_text,
        poll_votes (
          id,
          user_id,
          emoji
        )
      )
    `)
    .eq('group_id', group_id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const activePoll = activePolls?.[0] || null

  const { data: outings } = await supabase
    .from('outings')
    .select('*')
    .eq('group_id', group_id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5)

  const members = group.group_members || []

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
          <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
          <p className="text-slate-600 mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PlanPalChat groupId={group_id} />

            {activePoll ? (
              <PollComponent groupId={group_id} initialPoll={activePoll} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Polls</CardTitle>
                  <CardDescription>Vote for your preferred option</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">No active polls</p>
                  <CreatePollDialog groupId={group_id} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Outings</CardTitle>
                <CardDescription>Planned activities for this group</CardDescription>
              </CardHeader>
              <CardContent>
                {outings && outings.length > 0 ? (
                  <div className="space-y-3">
                    {outings.map((outing) => (
                      <div
                        key={outing.id}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{outing.title}</p>
                          {outing.scheduled_at && (
                            <p className="text-sm text-slate-600">
                              {format(new Date(outing.scheduled_at), 'EEEE, MMMM d, h:mm a')}
                            </p>
                          )}
                          {outing.location && (
                            <p className="text-sm text-slate-500">{outing.location}</p>
                          )}
                          {outing.mood && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              {outing.mood}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No upcoming outings</p>
                )}
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
                  {members.map((member: any) => {
                    const profile = member.profiles
                    const displayName = profile?.full_name || profile?.username || 'Anonymous'
                    const initial = displayName.charAt(0).toUpperCase()

                    return (
                      <div key={member.user_id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {initial}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm">{displayName}</span>
                          {member.role === 'admin' && (
                            <span className="ml-2 text-xs text-slate-500">(Admin)</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CreateOutingDialog groupId={group_id} />
                {!activePoll && (
                  <CreatePollDialog groupId={group_id} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
