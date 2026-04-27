import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const html = (title: string, heading: string, body: string, isError = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Busy Moms — ${title}</title>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      max-width: 520px;
      margin: 100px auto;
      padding: 0 24px;
      color: #1a1a1a;
      background: ${isError ? '#FEF6F0' : '#DCD3E8'};
    }
    h1 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2rem;
      margin-bottom: 16px;
    }
    p { color: #444; line-height: 1.7; margin-bottom: 12px; }
    a { color: #1a1a1a; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${heading}</h1>
  ${body}
</body>
</html>`

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(
      html(
        'Invalid Link',
        'Link invalid or expired',
        '<p>No token was provided. Please <a href="https://www.busymomsassistantai.com/#delete-account">submit a new request</a>.</p>',
        true,
      ),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await supabase
    .from('deletion_requests')
    .select('id, email, confirmed_at, expires_at')
    .eq('token', token)
    .single()

  if (error || !data) {
    return new Response(
      html(
        'Invalid Link',
        'Link invalid or expired',
        '<p>This link is invalid or has already been used. Please <a href="https://www.busymomsassistantai.com/#delete-account">submit a new request</a>.</p>',
        true,
      ),
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  if (data.confirmed_at !== null) {
    return new Response(
      html(
        'Already Confirmed',
        'Request already confirmed',
        '<p>This link has already been used. Your deletion request is being processed.</p>',
        true,
      ),
      { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  if (new Date(data.expires_at) < new Date()) {
    return new Response(
      html(
        'Link Expired',
        'Link expired',
        '<p>This link has expired (links are valid for 24 hours). Please <a href="https://www.busymomsassistantai.com/#delete-account">submit a new request</a>.</p>',
        true,
      ),
      { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  // Mark confirmed
  const confirmedAt = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('deletion_requests')
    .update({ confirmed_at: confirmedAt })
    .eq('id', data.id)

  if (updateError) {
    console.error('[confirm-deletion] DB update error:', updateError.message)
  }

  // Notify team — best-effort, never blocks the confirmation response
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.log('[confirm-deletion] Team notification skipped (no RESEND_API_KEY set)')
  } else {
    try {
      const notifyRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Busy Moms <${Deno.env.get('FROM_EMAIL')}>`,
          to: [Deno.env.get('DELETION_NOTIFY_EMAIL')],
          subject: 'Account deletion request confirmed — manual action needed',
          html: `
            <p>User email: ${data.email}</p>
            <p>Confirmed at: ${confirmedAt}</p>
          `,
        }),
      })
      if (!notifyRes.ok) {
        console.error('[confirm-deletion] Resend notify error:', await notifyRes.text())
      }
    } catch (emailErr) {
      console.error('[confirm-deletion] Team notification failed:', (emailErr as Error).message)
    }
  }

  return new Response(
    html(
      'Deletion Request Confirmed',
      'Deletion request confirmed',
      `
        <p>Your request has been received. We'll process it within 30 days.</p>
        <p>If you have an active App Store subscription, please cancel it yourself in
        <strong>Settings → Apple ID → Subscriptions</strong> — Apple does not allow us
        to cancel subscriptions on your behalf.</p>
      `,
    ),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
})
