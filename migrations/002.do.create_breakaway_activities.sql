CREATE TABLE breakaway_activities(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER REFERENCES breakaway_users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    duration DECIMAL(5, 2) NOT NULL,
    distance DECIMAL(5,2) NOT NULL,
    description TEXT,
    date_published TIMESTAMPTZ DEFAULT now() NOT NULL
);