import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
  } catch {
    // Malformed body — return ok anyway (no leak)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Basic email validation — silently succeed on invalid input
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Rate check: max 3 requests per email per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('deletion_requests')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneHourAgo)

  if ((count ?? 0) >= 3) {
    // Rate limited — still return ok: true (no enumeration leak)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Insert deletion request row (token and expires_at are set by DB defaults)
  const { data, error } = await supabase
    .from('deletion_requests')
    .insert({ email })
    .select('token')
    .single()

  if (error || !data) {
    console.error('[request-deletion] DB insert error:', error?.message)
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-deletion?token=${data.token}`

  // Send confirmation email — best-effort, never blocks row insertion or response
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.log('[request-deletion] Email send skipped (no RESEND_API_KEY set)')
  } else {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Busy Moms <${Deno.env.get('FROM_EMAIL')}>`,
          to: [email],
          subject: 'Confirm your Busy Moms account deletion request',
          html: `
            <p>Hi,</p>
            <p>We received a request to delete your Busy Moms account and all associated data.</p>
            <p>To confirm, click the link below. It expires in 24 hours.</p>
            <p><a href="${confirmUrl}">Confirm account deletion</a></p>
            <p>If you did not make this request, ignore this email. Your account will not be affected.</p>
            <p>— The Busy Moms team</p>
          `,
        }),
      })
      if (!resendRes.ok) {
        console.error('[request-deletion] Resend error:', await resendRes.text())
      }
    } catch (emailErr) {
      console.error('[request-deletion] Email send failed:', (emailErr as Error).message)
    }
  }

  // Always return ok: true — the client always shows the same message
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
