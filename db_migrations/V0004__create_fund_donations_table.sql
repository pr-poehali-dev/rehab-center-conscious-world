CREATE TABLE t_p7834125_rehab_center_conscio.fund_donations (
    id SERIAL PRIMARY KEY,
    donor_id VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    donated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fund_donations_donor_id ON t_p7834125_rehab_center_conscio.fund_donations(donor_id);
