CREATE TABLE t_p7834125_rehab_center_conscio.bookings (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_city VARCHAR(255),
    service VARCHAR(100),
    preferred_date DATE,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_phone ON t_p7834125_rehab_center_conscio.bookings(client_phone);
CREATE INDEX idx_bookings_created_at ON t_p7834125_rehab_center_conscio.bookings(created_at);
