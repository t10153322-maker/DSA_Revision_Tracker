-- DSA Revision Tracker Database Schema
-- This schema supports PostgreSQL, MySQL, and SQLite with minor modifications

-- Users table (for future multi-user support)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Problems table - main entity for DSA problems
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    url TEXT,
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('Not Started', 'Practicing', 'Solved', 'Mastered')) DEFAULT 'Not Started',
    attempts INTEGER DEFAULT 0,
    last_practiced DATE,
    
    -- Spaced repetition fields
    next_review_date DATE,
    ease_factor DECIMAL(3,2) DEFAULT 2.50 CHECK (ease_factor >= 1.30 AND ease_factor <= 2.50),
    interval_days INTEGER DEFAULT 1,
    consecutive_correct INTEGER DEFAULT 0,
    consecutive_easy INTEGER DEFAULT 0,
    is_conquered BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_problems_user_id (user_id),
    INDEX idx_problems_next_review (next_review_date),
    INDEX idx_problems_topic (topic),
    INDEX idx_problems_difficulty (difficulty),
    INDEX idx_problems_status (status),
    INDEX idx_problems_is_conquered (is_conquered)
);

-- Review sessions table - tracks each practice session
CREATE TABLE review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    was_correct BOOLEAN NOT NULL,
    difficulty VARCHAR(10) CHECK (difficulty IN ('Easy', 'Hard')) NOT NULL,
    time_spent_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_review_sessions_problem_id (problem_id),
    INDEX idx_review_sessions_user_id (user_id),
    INDEX idx_review_sessions_date (session_date)
);

-- Daily revision stats table - for analytics
CREATE TABLE daily_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    revision_date DATE NOT NULL,
    problems_reviewed INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    newly_conquered INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per user per day
    UNIQUE(user_id, revision_date),
    INDEX idx_daily_revisions_user_date (user_id, revision_date)
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_goal INTEGER DEFAULT 10,
    reminder_time TIME DEFAULT '09:00:00',
    email_notifications BOOLEAN DEFAULT true,
    conquest_threshold INTEGER DEFAULT 8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Problem tags table (many-to-many relationship)
CREATE TABLE problem_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(problem_id, tag_name),
    INDEX idx_problem_tags_problem_id (problem_id),
    INDEX idx_problem_tags_tag_name (tag_name)
);

-- Triggers for updating timestamps (PostgreSQL example)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_problems_updated_at 
    BEFORE UPDATE ON problems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample indexes for performance optimization
CREATE INDEX idx_problems_compound_review ON problems(user_id, next_review_date, is_conquered);
CREATE INDEX idx_review_sessions_compound ON review_sessions(problem_id, session_date DESC);

-- Views for common queries
CREATE VIEW problem_stats AS
SELECT 
    p.id,
    p.title,
    p.topic,
    p.difficulty,
    p.attempts,
    p.consecutive_correct,
    p.consecutive_easy,
    p.is_conquered,
    COUNT(rs.id) as total_reviews,
    COUNT(CASE WHEN rs.was_correct THEN 1 END) as correct_reviews,
    ROUND(
        COUNT(CASE WHEN rs.was_correct THEN 1 END) * 100.0 / NULLIF(COUNT(rs.id), 0), 
        2
    ) as success_rate,
    MAX(rs.session_date) as last_review_date
FROM problems p
LEFT JOIN review_sessions rs ON p.id = rs.problem_id
GROUP BY p.id, p.title, p.topic, p.difficulty, p.attempts, p.consecutive_correct, p.consecutive_easy, p.is_conquered;

-- View for today's revision problems
CREATE VIEW todays_revision AS
SELECT p.*
FROM problems p
WHERE p.next_review_date <= CURRENT_DATE
  AND p.is_conquered = false
ORDER BY 
    CASE 
        WHEN p.next_review_date < CURRENT_DATE THEN 0 -- Overdue first
        ELSE 1 
    END,
    p.next_review_date ASC,
    CASE p.difficulty 
        WHEN 'Hard' THEN 1
        WHEN 'Medium' THEN 2
        WHEN 'Easy' THEN 3
    END;

-- Sample data insertion (optional)
-- INSERT INTO users (email, username, password_hash) 
-- VALUES ('demo@example.com', 'demo_user', '$2b$10$example_hash');

-- Note: For production use, consider:
-- 1. Adding proper foreign key constraints
-- 2. Setting up connection pooling
-- 3. Implementing proper backup strategies
-- 4. Adding audit trails
-- 5. Setting up monitoring and logging
-- 6. Implementing data retention policies