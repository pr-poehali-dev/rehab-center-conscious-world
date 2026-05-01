CREATE TABLE t_p7834125_rehab_center_conscio.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p7834125_rehab_center_conscio.otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p7834125_rehab_center_conscio.sessions (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES t_p7834125_rehab_center_conscio.users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p7834125_rehab_center_conscio.favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p7834125_rehab_center_conscio.users(id),
    specialist_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, specialist_id)
);

CREATE INDEX idx_otp_codes_email ON t_p7834125_rehab_center_conscio.otp_codes(email);
CREATE INDEX idx_sessions_token ON t_p7834125_rehab_center_conscio.sessions(token);
CREATE INDEX idx_sessions_user_id ON t_p7834125_rehab_center_conscio.sessions(user_id);
CREATE INDEX idx_favorites_user_id ON t_p7834125_rehab_center_conscio.favorites(user_id);
