'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string
  const homeLatitude = formData.get('homeLatitude') as string
  const homeLongitude = formData.get('homeLongitude') as string
  const homeAddress = formData.get('homeAddress') as string
  const defaultMood = formData.get('defaultMood') as string

  const updateData: any = {
    full_name: fullName || null,
    username: username || null,
    home_address: homeAddress || null,
    default_mood: defaultMood || null,
  }

  if (homeLatitude && homeLongitude) {
    updateData.home_latitude = parseFloat(homeLatitude)
    updateData.home_longitude = parseFloat(homeLongitude)
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfile) {
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    const { error } = await supabase
      .from('profiles')
      .insert({ id: user.id, ...updateData })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/profile')
  return { success: true }
}
