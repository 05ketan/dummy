'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    return { error: 'Group name is required' }
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      created_by: user.id,
    })
    .select()
    .single()

  if (groupError) {
    return { error: groupError.message }
  }

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin',
    })

  if (memberError) {
    return { error: memberError.message }
  }

  revalidatePath('/groups')
  return { success: true, groupId: group.id }
}
