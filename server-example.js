// Example Express.js server implementation
// This is a basic example - you'll need to adapt it to your preferred backend framework

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // or your preferred database client
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

// GET /api/problems - Get all problems for a user
app.get('/api/problems', asyncHandler(async (req, res) => {
  const userId = req.headers['user-id'] || 'demo-user'; // In production, get from JWT token
  
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'problemId', rs.problem_id,
                 'date', rs.session_date,
                 'wasCorrect', rs.was_correct,
                 'difficulty', rs.difficulty,
                 'notes', rs.notes,
                 'timeSpent', rs.time_spent_minutes
               ) ORDER BY rs.session_date DESC
             ) FILTER (WHERE rs.id IS NOT NULL), 
             '[]'
           ) as review_history
    FROM problems p
    LEFT JOIN review_sessions rs ON p.id = rs.problem_id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [userId]);

  const problems = result.rows.map(row => ({
    id: row.id,
    title: row.title,
    platform: row.platform,
    difficulty: row.difficulty,
    topic: row.topic,
    url: row.url,
    notes: row.notes,
    status: row.status,
    attempts: row.attempts,
    lastPracticed: row.last_practiced,
    nextReviewDate: row.next_review_date,
    easeFactor: parseFloat(row.ease_factor),
    interval: row.interval_days,
    consecutiveCorrect: row.consecutive_correct,
    consecutiveEasy: row.consecutive_easy,
    isConquered: row.is_conquered,
    reviewHistory: row.review_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  res.json(problems);
}));

// POST /api/problems - Create a new problem
app.post('/api/problems', asyncHandler(async (req, res) => {
  const userId = req.headers['user-id'] || 'demo-user';
  const {
    title, platform, difficulty, topic, url, notes,
    easeFactor = 2.5, interval = 1, consecutiveCorrect = 0,
    consecutiveEasy = 0, isConquered = false
  } = req.body;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  const result = await pool.query(`
    INSERT INTO problems (
      user_id, title, platform, difficulty, topic, url, notes,
      ease_factor, interval_days, consecutive_correct, consecutive_easy,
      is_conquered, next_review_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    userId, title, platform, difficulty, topic, url, notes,
    easeFactor, interval, consecutiveCorrect, consecutiveEasy,
    isConquered, nextReviewDate.toISOString().split('T')[0]
  ]);

  const problem = {
    id: result.rows[0].id,
    title: result.rows[0].title,
    platform: result.rows[0].platform,
    difficulty: result.rows[0].difficulty,
    topic: result.rows[0].topic,
    url: result.rows[0].url,
    notes: result.rows[0].notes,
    status: result.rows[0].status,
    attempts: result.rows[0].attempts,
    lastPracticed: result.rows[0].last_practiced,
    nextReviewDate: result.rows[0].next_review_date,
    easeFactor: parseFloat(result.rows[0].ease_factor),
    interval: result.rows[0].interval_days,
    consecutiveCorrect: result.rows[0].consecutive_correct,
    consecutiveEasy: result.rows[0].consecutive_easy,
    isConquered: result.rows[0].is_conquered,
    reviewHistory: [],
    createdAt: result.rows[0].created_at,
    updatedAt: result.rows[0].updated_at
  };

  res.status(201).json(problem);
}));

// PUT /api/problems/:id - Update a problem
app.put('/api/problems/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'] || 'demo-user';
  const updates = req.body;

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'createdAt' && key !== 'reviewHistory') {
      const dbField = key === 'easeFactor' ? 'ease_factor' :
                     key === 'interval' ? 'interval_days' :
                     key === 'consecutiveCorrect' ? 'consecutive_correct' :
                     key === 'consecutiveEasy' ? 'consecutive_easy' :
                     key === 'isConquered' ? 'is_conquered' :
                     key === 'lastPracticed' ? 'last_practiced' :
                     key === 'nextReviewDate' ? 'next_review_date' :
                     key === 'updatedAt' ? 'updated_at' :
                     key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      updateFields.push(`${dbField} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // Add review history if provided
  if (updates.reviewHistory && updates.reviewHistory.length > 0) {
    const latestReview = updates.reviewHistory[updates.reviewHistory.length - 1];
    
    await pool.query(`
      INSERT INTO review_sessions (problem_id, user_id, session_date, was_correct, difficulty, notes, time_spent_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [
      id, userId, latestReview.date, latestReview.wasCorrect,
      latestReview.difficulty, latestReview.notes, latestReview.timeSpent
    ]);
  }

  values.push(id, userId);
  const result = await pool.query(`
    UPDATE problems 
    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  // Get updated problem with review history
  const problemResult = await pool.query(`
    SELECT p.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'problemId', rs.problem_id,
                 'date', rs.session_date,
                 'wasCorrect', rs.was_correct,
                 'difficulty', rs.difficulty,
                 'notes', rs.notes,
                 'timeSpent', rs.time_spent_minutes
               ) ORDER BY rs.session_date DESC
             ) FILTER (WHERE rs.id IS NOT NULL), 
             '[]'
           ) as review_history
    FROM problems p
    LEFT JOIN review_sessions rs ON p.id = rs.problem_id
    WHERE p.id = $1
    GROUP BY p.id
  `, [id]);

  const problem = problemResult.rows[0];
  res.json({
    id: problem.id,
    title: problem.title,
    platform: problem.platform,
    difficulty: problem.difficulty,
    topic: problem.topic,
    url: problem.url,
    notes: problem.notes,
    status: problem.status,
    attempts: problem.attempts,
    lastPracticed: problem.last_practiced,
    nextReviewDate: problem.next_review_date,
    easeFactor: parseFloat(problem.ease_factor),
    interval: problem.interval_days,
    consecutiveCorrect: problem.consecutive_correct,
    consecutiveEasy: problem.consecutive_easy,
    isConquered: problem.is_conquered,
    reviewHistory: problem.review_history,
    createdAt: problem.created_at,
    updatedAt: problem.updated_at
  });
}));

// DELETE /api/problems/:id - Delete a problem
app.delete('/api/problems/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'] || 'demo-user';

  const result = await pool.query(
    'DELETE FROM problems WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  res.status(204).send();
}));

// POST /api/problems/sync - Sync problems with server
app.post('/api/problems/sync', asyncHandler(async (req, res) => {
  const userId = req.headers['user-id'] || 'demo-user';
  const { problems } = req.body;

  // This is a simplified sync - in production, you'd want more sophisticated conflict resolution
  // For now, we'll just return the server's version of the data
  
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'problemId', rs.problem_id,
                 'date', rs.session_date,
                 'wasCorrect', rs.was_correct,
                 'difficulty', rs.difficulty,
                 'notes', rs.notes,
                 'timeSpent', rs.time_spent_minutes
               ) ORDER BY rs.session_date DESC
             ) FILTER (WHERE rs.id IS NOT NULL), 
             '[]'
           ) as review_history
    FROM problems p
    LEFT JOIN review_sessions rs ON p.id = rs.problem_id
    WHERE p.user_id = $1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [userId]);

  const serverProblems = result.rows.map(row => ({
    id: row.id,
    title: row.title,
    platform: row.platform,
    difficulty: row.difficulty,
    topic: row.topic,
    url: row.url,
    notes: row.notes,
    status: row.status,
    attempts: row.attempts,
    lastPracticed: row.last_practiced,
    nextReviewDate: row.next_review_date,
    easeFactor: parseFloat(row.ease_factor),
    interval: row.interval_days,
    consecutiveCorrect: row.consecutive_correct,
    consecutiveEasy: row.consecutive_easy,
    isConquered: row.is_conquered,
    reviewHistory: row.review_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));

  res.json(serverProblems);
}));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(port, () => {
  console.log(`DSA Tracker API server running on port ${port}`);
});

module.exports = app;