import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'

export default async function GroupsPage() {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Groups</h1>
            <p className="text-slate-600 mt-1">Manage and plan outings with your friends</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-slate-500">5 members</span>
              </div>
              <CardTitle className="mt-4">Weekend Warriors</CardTitle>
              <CardDescription>Friends who love adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Last active: 2 days ago</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors cursor-pointer flex items-center justify-center min-h-[200px]">
            <div className="text-center p-6">
              <Plus className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 font-medium">Create a new group</p>
              <p className="text-sm text-slate-500 mt-1">Start planning with friends</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
