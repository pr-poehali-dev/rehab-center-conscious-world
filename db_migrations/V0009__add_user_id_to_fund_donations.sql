ALTER TABLE t_p7834125_rehab_center_conscio.fund_donations
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES t_p7834125_rehab_center_conscio.users(id);

CREATE INDEX IF NOT EXISTS idx_fund_donations_user_id ON t_p7834125_rehab_center_conscio.fund_donations(user_id);
