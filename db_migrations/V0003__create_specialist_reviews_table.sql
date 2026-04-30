CREATE TABLE t_p7834125_rehab_center_conscio.specialist_reviews (
    id SERIAL PRIMARY KEY,
    specialist_id VARCHAR(50) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_specialist_reviews_specialist_id ON t_p7834125_rehab_center_conscio.specialist_reviews(specialist_id);
CREATE INDEX idx_specialist_reviews_created_at ON t_p7834125_rehab_center_conscio.specialist_reviews(created_at);
