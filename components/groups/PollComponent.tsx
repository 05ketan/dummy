'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PollOption {
  id: string
  external_id: string
  name: string
  votes: number
}

interface PollComponentProps {
  pollId: string
}

export function PollComponent({ pollId }: PollComponentProps) {
  const [options, setOptions] = useState<PollOption[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`poll_${pollId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_results',
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log('Poll update:', payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId, supabase])

  const handleVote = async (optionId: string, emoji: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('poll_votes').insert({
      poll_option_id: optionId,
      user_id: user.id,
      emoji_reaction: emoji,
    })

    if (error) {
      console.error('Error voting:', error)
    }
  }

  if (loading) {
    return <div>Loading poll...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>Choose your favorite option with an emoji reaction</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium">{option.name}</p>
                <p className="text-sm text-slate-600">{option.votes} votes</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(option.id, '👍')}
                >
                  👍
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(option.id, '❤️')}
                >
                  ❤️
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(option.id, '🔥')}
                >
                  🔥
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
