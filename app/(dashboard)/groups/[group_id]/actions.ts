'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPoll(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const groupId = formData.get('groupId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const pollType = formData.get('pollType') as string
  const options = formData.getAll('options') as string[]

  if (!title || options.length < 2) {
    return { error: 'Poll must have a title and at least 2 options' }
  }

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      group_id: groupId,
      created_by: user.id,
      title,
      description,
      poll_type: pollType || 'custom',
      status: 'active',
    })
    .select()
    .single()

  if (pollError) {
    return { error: pollError.message }
  }

  const pollOptions = options.filter(opt => opt.trim()).map(option => ({
    poll_id: poll.id,
    option_text: option,
  }))

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(pollOptions)

  if (optionsError) {
    return { error: optionsError.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function voteOnPoll(pollId: string, optionId: string, emoji: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: existingVote } = await supabase
    .from('poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('option_id', optionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingVote) {
    const { error } = await supabase
      .from('poll_votes')
      .delete()
      .eq('id', existingVote.id)

    if (error) {
      return { error: error.message }
    }
    return { success: true, action: 'removed' }
  } else {
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
        emoji,
      })

    if (error) {
      return { error: error.message }
    }
    return { success: true, action: 'added' }
  }
}

export async function createOuting(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const groupId = formData.get('groupId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const scheduledAt = formData.get('scheduledAt') as string
  const activityType = formData.get('activityType') as string
  const mood = formData.get('mood') as string

  if (!title) {
    return { error: 'Title is required' }
  }

  const { error } = await supabase
    .from('outings')
    .insert({
      group_id: groupId,
      created_by: user.id,
      title,
      description,
      location,
      scheduled_at: scheduledAt || null,
      activity_type: activityType || null,
      mood: mood || null,
      status: 'planned',
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
