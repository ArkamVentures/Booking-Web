// @ts-nocheck
// Supabase Edge Function: handles GET (list bookings) and POST (create booking)
// This runs on Deno, not Node — the syntax is similar to JavaScript but imports
// work a little differently (using full URLs instead of npm package names).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// These are automatically available inside every Supabase Edge Function —
// you don't need to set them yourself.
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Headers that allow your frontend (running on a different domain) to call this function.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Browsers send an OPTIONS request first to check CORS — just approve it.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ---- GET: return bookings, optionally filtered ----
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    const category = url.searchParams.get('category')

    let query = supabase.from('bookings').select('*').order('date', { ascending: true })
    if (date) query = query.eq('date', date)
    if (category) query = query.eq('category', category)

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // ---- POST: create a new booking ----
  if (req.method === 'POST') {
    let body
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Request body must be a valid JSON object' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { name, date, time_slot, category, note } = body

    if (!name || !date || !time_slot || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // STEP 1: check if this date + time_slot is already booked.
    const { data: existing, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time_slot', time_slot)

    if (checkError) {
      return new Response(JSON.stringify({ error: checkError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: 'This slot is already booked' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // STEP 2: insert the new booking.
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ name, date, time_slot, category, note }])
      .select()

    if (error) {
      // Backup safety net: the database's "unique" rule blocks exact duplicates.
      if (error.code === '23505') {
        return new Response(JSON.stringify({ error: 'This slot is already booked' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(data[0]), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Any other method isn't supported.
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
