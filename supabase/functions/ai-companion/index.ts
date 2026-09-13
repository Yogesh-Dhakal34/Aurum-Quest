// Phase 9: ai-companion Edge Function
//
// This is the ONLY place in the app allowed to call an LLM. It never
// writes to quest_progress, quest_definitions, or player_state — it
// only ever inserts a row into ai_suggestions, which is inert until a
// user explicitly approves it client-side (see aiService.ts). This is
// the enforcement point for GAMEPLAY.md §17's hard rules, not just a
// convention: even a fully compromised prompt/response can't do more
// than get an AiSuggestion row written.
//
// Model note: Gemini model names and the generateContent vs
// Interactions API split change faster than this comment will age.
// GEMINI_MODEL is a secret/env var, not hardcoded, precisely so a
// model retirement doesn't require a redeploy of logic — just an
// updated secret. Verify the current free-tier model list at
// ai.google.dev before first deploy.
//
// Deploy: supabase functions deploy ai-companion
// Secrets required: GEMINI_API_KEY, GEMINI_MODEL (e.g. "gemini-2.0-flash")
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
// Supabase platform — do not set them manually.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Required for the browser client (supabase.functions.invoke) to be
// able to call this at all. Without these, the browser's OPTIONS
// preflight request gets no CORS headers back and blocks the real
// request before it ever reaches this function -- curl/Postman work
// fine without this since preflight is a browser-only mechanism, which
// is why this can pass a curl smoke test and still fail from the app.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RequestBody = {
  type: 'daily_strategy' | 'weekly_reflection'
}

type QuestRow = {
  title: string
  category: string
  progress: number
  target: number
  completed: boolean
}

function getGmtDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

/** Calls Gemini's generateContent endpoint. Throws on any non-2xx. */
async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY ?? '',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') {
    throw new Error('Gemini response missing expected text content')
  }
  return text
}

function buildDailyStrategyPrompt(quests: QuestRow[]): string {
  const incomplete = quests.filter((q) => !q.completed)
  const completed = quests.filter((q) => q.completed)

  const questLines = incomplete
    .map((q) => `- [${q.category}] ${q.title} (${q.progress}/${q.target})`)
    .join('\n')

  return `You are a calm, encouraging productivity coach inside a gamified habit app called Aurum Quest. Based on today's quest list, suggest which 1-3 unfinished quests the user should prioritize next and briefly say why. Be specific and concise (under 120 words total). Do not invent quests that aren't listed. Do not use markdown headers.

Completed today: ${completed.length}
Unfinished quests:
${questLines || '(none — all quests completed today)'}

Respond in plain text: a short strategy suggestion, then a one-sentence reason.`
}

function buildWeeklyReflectionPrompt(summary: {
  totalXp: number
  questsCompleted: number
  daysActive: number
  categoryTotals: Record<string, number>
}): string {
  const categoryLines = Object.entries(summary.categoryTotals)
    .map(([cat, total]) => `- ${cat}: ${total}`)
    .join('\n')

  return `You are a calm, encouraging productivity coach inside a gamified habit app called Aurum Quest. Summarize the user's past 7 days and ask one useful, specific reflection question to help them plan next week. Be concise (under 150 words). Do not use markdown headers.

Past 7 days:
- Total XP earned: ${summary.totalXp}
- Quests completed: ${summary.questsCompleted}
- Active days: ${summary.daysActive}/7
- Category breakdown:
${categoryLines || '(no completed quests this week)'}

Respond in plain text: a short summary, then one reflection question.`
}

Deno.serve(async (req) => {
  // Browser preflight -- must return before any other check, with no
  // body required, just the CORS headers.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!GEMINI_API_KEY) {
    return jsonResponse({ error: 'AI companion is not configured (missing GEMINI_API_KEY)' }, 503)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401)
  }

  // Client scoped to the caller's own JWT — used only to identify who
  // is asking, never to read/write ai_suggestions (that's the service
  // client below, which bypasses RLS on purpose since inserts here
  // are the one legitimate server-side write path).
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

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  if (body.type !== 'daily_strategy' && body.type !== 'weekly_reflection') {
    return jsonResponse({ error: 'Unsupported suggestion type' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const todayKey = getGmtDateKey()

  // --- Rate limit / cost ceiling ---
  // daily_strategy: at most one per user per date_key.
  // weekly_reflection: at most one per user per rolling 7 days.
  if (body.type === 'daily_strategy') {
    const { data: existing, error } = await admin
      .from('ai_suggestions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'daily_strategy')
      .eq('date_key', todayKey)
      .limit(1)

    if (error) return jsonResponse({ error: error.message }, 500)
    if (existing && existing.length > 0) {
      return jsonResponse({ error: 'Daily strategy already generated for today' }, 429)
    }
  } else {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

    const { data: existing, error } = await admin
      .from('ai_suggestions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'weekly_reflection')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(1)

    if (error) return jsonResponse({ error: error.message }, 500)
    if (existing && existing.length > 0) {
      return jsonResponse({ error: 'Weekly reflection already generated in the last 7 days' }, 429)
    }
  }

  try {
    let content: string
    let reasoning: string | null = null

    if (body.type === 'daily_strategy') {
      const [{ data: definitions, error: defErr }, { data: progress, error: progErr }] =
        await Promise.all([
          admin
            .from('quest_definitions')
            .select('id, title, category')
            .eq('is_active', true),
          admin
            .from('quest_progress')
            .select('quest_definition_id, progress, target, completed')
            .eq('user_id', user.id)
            .eq('date_key', todayKey),
        ])

      if (defErr) throw defErr
      if (progErr) throw progErr

      const progressByQuestId = new Map((progress ?? []).map((p) => [p.quest_definition_id, p]))
      const quests: QuestRow[] = (definitions ?? []).map((d) => {
        const p = progressByQuestId.get(d.id)
        return {
          title: d.title,
          category: d.category,
          progress: p?.progress ?? 0,
          target: p?.target ?? 1,
          completed: p?.completed ?? false,
        }
      })

      const prompt = buildDailyStrategyPrompt(quests)
      content = await callGemini(prompt)
      reasoning = 'Generated from today\'s unfinished quest list.'
    } else {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6)
      const startKey = getGmtDateKey(sevenDaysAgo)

      const [{ data: definitions, error: defErr }, { data: rows, error: rowsErr }] =
        await Promise.all([
          admin.from('quest_definitions').select('id, category, xp_reward'),
          admin
            .from('quest_progress')
            .select('quest_definition_id, date_key, completed, progress')
            .eq('user_id', user.id)
            .gte('date_key', startKey)
            .lte('date_key', todayKey),
        ])

      if (defErr) throw defErr
      if (rowsErr) throw rowsErr

      const defById = new Map((definitions ?? []).map((d) => [d.id, d]))
      const completedRows = (rows ?? []).filter((r) => r.completed)

      const totalXp = completedRows.reduce((sum, r) => {
        const def = defById.get(r.quest_definition_id)
        return sum + (def?.xp_reward ?? 0)
      }, 0)

      const categoryTotals: Record<string, number> = {}
      for (const r of completedRows) {
        const def = defById.get(r.quest_definition_id)
        if (!def) continue
        categoryTotals[def.category] = (categoryTotals[def.category] ?? 0) + r.progress
      }

      const daysActive = new Set(completedRows.map((r) => r.date_key)).size

      const prompt = buildWeeklyReflectionPrompt({
        totalXp,
        questsCompleted: completedRows.length,
        daysActive,
        categoryTotals,
      })
      content = await callGemini(prompt)
      reasoning = 'Generated from the last 7 days of quest activity.'
    }

    const { data: inserted, error: insertError } = await admin
      .from('ai_suggestions')
      .insert({
        user_id: user.id,
        type: body.type,
        content,
        reasoning,
        date_key: todayKey,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return jsonResponse({ suggestion: inserted })
  } catch (err) {
    console.error('ai-companion error:', err)
    return jsonResponse({ error: 'Failed to generate AI suggestion' }, 502)
  }
})