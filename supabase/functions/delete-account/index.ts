// Phase 10: delete-account Edge Function
//
// Deleting an auth.users row requires the Admin API, which requires
// the service role key -- no client-side key can do this, by design.
// Every user-data table already cascades from auth.users (directly,
// or via profiles which itself cascades from auth.users), so a single
// admin.deleteUser call is enough to remove everything: profiles,
// player_state, character_stats, character_skills, realm_state,
// quest_progress, achievement_progress, weekly_journal, and
// ai_suggestions all disappear as a side effect of this one call,
// verified against each table's actual FK definition before writing
// this function, not assumed.
//
// CORS handling included from the start this time -- ai-companion's
// first version shipped without it and broke browser calls silently
// while curl still passed, so this function is built with that
// lesson already applied instead of rediscovering it.
//
// Deploy: supabase functions deploy delete-account
// No new secrets needed -- reuses the same auto-injected
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY every function gets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Identify the caller from their own JWT before doing anything
  // destructive -- this is what stops the function from being usable
  // to delete anyone other than whoever is actually authenticated in
  // this request.
  const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser()

  if (authError || !user) {
    return jsonResponse({ error: 'Invalid or expired session' }, 401)
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('delete-account error:', deleteError)
    return jsonResponse({ error: 'Failed to delete account' }, 502)
  }

  return jsonResponse({ deleted: true })
})