-- ============================================================
-- Supabase Setup for: Time Slot Booking Web App
-- Run this entire file once in the Supabase SQL Editor.
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================


-- ------------------------------------------------------------
-- 1. BOOKINGS TABLE
-- Creates the main table that stores every booking.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  date       DATE        NOT NULL,
  time_slot  TEXT        NOT NULL,
  category   TEXT        NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2. UNIQUE CONSTRAINT
-- Prevents two bookings on the same date + time slot.
-- The Edge Function also checks this, but the database is the
-- final safety net (returns error code 23505 on conflict).
-- ------------------------------------------------------------
ALTER TABLE bookings
  ADD CONSTRAINT bookings_date_time_slot_unique
  UNIQUE (date, time_slot);


-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- Supabase requires RLS to be enabled on every table.
-- These policies allow the anon key (used by the frontend)
-- to read and write bookings through the Edge Functions.
-- ------------------------------------------------------------
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon delete"
  ON bookings FOR DELETE
  USING (true);


-- ------------------------------------------------------------
-- 4. DEMO DATA
-- Five sample bookings so the app looks populated from the start.
-- Safe to skip or delete these rows at any time.
-- ------------------------------------------------------------
INSERT INTO bookings (name, date, time_slot, category, note) VALUES
  ('Demo User 1', '2026-08-03', '9:00 AM - 9:30 AM',   'Meeting',          'Project discussion'),
  ('Demo User 2', '2026-08-03', '10:00 AM - 10:30 AM', 'Interview',        'Team interview'),
  ('Demo User 3', '2026-08-04', '1:30 PM - 2:00 PM',   'Discussion',       'Technical discussion'),
  ('Demo User 4', '2026-08-05', '3:00 PM - 3:30 PM',   'Important Meeting','Planning meeting'),
  ('Demo User 5', '2026-08-06', '11:00 AM - 11:30 AM', 'Consultation',     'General consultation')
ON CONFLICT DO NOTHING;
