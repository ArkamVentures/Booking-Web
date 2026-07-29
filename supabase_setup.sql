CREATE TABLE IF NOT EXISTS bookings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  date       DATE        NOT NULL,
  time_slot  TEXT        NOT NULL,
  category   TEXT        NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings
  ADD CONSTRAINT bookings_date_time_slot_unique
  UNIQUE (date, time_slot);


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

INSERT INTO bookings (name, date, time_slot, category, note) VALUES
  ('Demo User 1', '2026-08-03', '9:00 AM - 9:30 AM',   'Meeting',          'Project discussion'),
  ('Demo User 2', '2026-08-03', '10:00 AM - 10:30 AM', 'Interview',        'Team interview'),
  ('Demo User 3', '2026-08-04', '1:30 PM - 2:00 PM',   'Discussion',       'Technical discussion'),
  ('Demo User 4', '2026-08-05', '3:00 PM - 3:30 PM',   'Important Meeting','Planning meeting'),
  ('Demo User 5', '2026-08-06', '11:00 AM - 11:30 AM', 'Consultation',     'General consultation')
ON CONFLICT DO NOTHING;
