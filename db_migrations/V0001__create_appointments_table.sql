CREATE TABLE t_p7834125_rehab_center_conscio.appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    client_email VARCHAR(255),
    service_name VARCHAR(255) NOT NULL,
    service_amount INTEGER NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'card',
    payment_id VARCHAR(100),
    order_id VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_phone ON t_p7834125_rehab_center_conscio.appointments(client_phone);
CREATE INDEX idx_appointments_payment_id ON t_p7834125_rehab_center_conscio.appointments(payment_id);
CREATE INDEX idx_appointments_status ON t_p7834125_rehab_center_conscio.appointments(payment_status);
