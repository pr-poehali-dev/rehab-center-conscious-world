ALTER TABLE t_p7834125_rehab_center_conscio.bookings
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES t_p7834125_rehab_center_conscio.users(id),
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON t_p7834125_rehab_center_conscio.bookings(user_id);
