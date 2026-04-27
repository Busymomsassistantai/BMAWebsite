// deletion.js — account deletion request flow
// Inserts directly into deletion_requests from the browser (same pattern as contact_messages).
// id, token, created_at, and expires_at are filled by database defaults.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { SUPABASE_URL, SUPABASE_KEY } from './config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function requestDeletion(email) {
  const { error } = await supabase
    .from('deletion_requests')
    .insert([{ email }])
  if (error) {
    console.error('[Deletion] DB error:', error.message)
    return false
  }
  return true
}
