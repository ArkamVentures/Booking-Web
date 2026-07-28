// Fixed options shown in the booking form.

export const TIME_SLOTS = [
  '9:00 AM - 9:30 AM',
  '10:00 AM - 10:30 AM',
  '11:00 AM - 11:30 AM',
  '1:30 PM - 2:00 PM',
  '3:00 PM - 3:30 PM',
]

export const CATEGORIES = [
  'Meeting',
  'Interview',
  'Discussion',
  'Important Meeting',
  'Consultation',
]

// The Supabase Edge Functions base URL. Comes from .env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL

// Edge Functions require this key on every request (in the Authorization header).
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
