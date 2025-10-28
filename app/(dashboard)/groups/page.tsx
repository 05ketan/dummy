import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog'
import { GroupCard } from '@/components/groups/GroupCard'
import { LogOut } from 'lucide-react'

export default async function GroupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: groups } = await supabase
    .from('groups')
    .select(`
      id,
      name,
      description,
      group_members (count)
    `)
    .order('created_at', { ascending: false })

  const groupsWithCount = groups?.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    member_count: Array.isArray(group.group_members) ? group.group_members.length : 0,
  })) || []

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Groups</h1>
            <p className="text-slate-600 mt-1">Manage and plan outings with your friends</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <CreateGroupDialog />
            <form action={signOut}>
              <Button variant="ghost" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {groupsWithCount.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">You haven't joined any groups yet</p>
            <CreateGroupDialog />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupsWithCount.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
