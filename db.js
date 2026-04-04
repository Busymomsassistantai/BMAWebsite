import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_KEY } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function saveFormData(data) {
  const { error } = await supabase
    .from('contact_messages')
    .insert([data])
  if (error) {
    console.error('DB error:', error.message)
    return false
  }
  return true
}
