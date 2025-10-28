'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description: string | null
    member_count: number
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-slate-500">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </span>
          </div>
          <CardTitle className="mt-4">{group.name}</CardTitle>
          {group.description && (
            <CardDescription>{group.description}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  )
}
