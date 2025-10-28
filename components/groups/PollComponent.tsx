'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { voteOnPoll } from '@/app/(dashboard)/groups/[group_id]/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PollOption {
  id: string
  option_text: string
  poll_votes: Array<{
    id: string
    user_id: string
    emoji: string
  }>
}

interface Poll {
  id: string
  title: string
  description: string | null
  status: string
  poll_options: PollOption[]
}

interface PollComponentProps {
  groupId: string
  initialPoll: Poll | null
}

export function PollComponent({ groupId, initialPoll }: PollComponentProps) {
  const [poll, setPoll] = useState<Poll | null>(initialPoll)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (!poll) return

    const currentPollId = poll.id

    async function loadPollData() {
      const { data } = await supabase
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
        .eq('id', currentPollId)
        .single()

      if (data) {
        setPoll(data as any)
      }
    }

    const channel = supabase
      .channel(`poll_${currentPollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
          filter: `poll_id=eq.${currentPollId}`,
        },
        () => {
          loadPollData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poll?.id, supabase])

  const handleVote = async (optionId: string, emoji: string) => {
    if (!poll || loading) return

    setLoading(true)
    const result = await voteOnPoll(poll.id, optionId, emoji)
    setLoading(false)

    if (result.error) {
      toast.error('Failed to vote', {
        description: result.error,
      })
    } else {
      const action = result.action === 'added' ? 'added' : 'removed'
      toast.success(`Vote ${action}`)
    }
  }

  const hasUserVoted = (option: PollOption) => {
    return option.poll_votes?.some(v => v.user_id === userId)
  }

  const getVoteCount = (option: PollOption) => {
    return option.poll_votes?.length || 0
  }

  if (!poll) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.title}</CardTitle>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {poll.poll_options.map((option) => (
            <div
              key={option.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                hasUserVoted(option) ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex-1">
                <p className="font-medium">{option.option_text}</p>
                <p className="text-sm text-slate-600">
                  {getVoteCount(option)} {getVoteCount(option) === 1 ? 'vote' : 'votes'}
                </p>
              </div>
              <div className="flex gap-2">
                {['👍', '❤️', '🔥'].map((emoji) => (
                  <Button
                    key={emoji}
                    size="sm"
                    variant={hasUserVoted(option) ? 'default' : 'outline'}
                    onClick={() => handleVote(option.id, emoji)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : emoji}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
