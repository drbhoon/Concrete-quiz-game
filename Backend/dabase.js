const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database schema
const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        best_score INTEGER DEFAULT 0,
        stars INTEGER DEFAULT 0,
        crowns INTEGER DEFAULT 0,
        consecutive_perfect_scores INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        date TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempts_username ON quiz_attempts(username);
      CREATE INDEX IF NOT EXISTS idx_attempts_date ON quiz_attempts(date DESC);
    `);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User operations
const getOrCreateUser = async (username) => {
  const client = await pool.connect();
  try {
    // Try to get existing user
    let result = await client.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    if (result.rows.length > 0) {
      // User exists, get their attempts
      const attemptsResult = await client.query(
        'SELECT score, total_questions, date FROM quiz_attempts WHERE username = $1 ORDER BY date DESC',
        [result.rows[0].username]
      );

      return {
        username: result.rows[0].username,
        bestScore: result.rows[0].best_score,
        attempts: attemptsResult.rows.map(a => ({
          score: a.score,
          totalQuestions: a.total_questions,
          date: a.date.toISOString()
        })),
        stars: result.rows[0].stars,
        crowns: result.rows[0].crowns,
        consecutivePerfectScores: result.rows[0].consecutive_perfect_scores
      };
    }

    // Create new user
    result = await client.query(
      'INSERT INTO users (username) VALUES ($1) RETURNING *',
      [username]
    );

    return {
      username: result.rows[0].username,
      bestScore: 0,
      attempts: [],
      stars: 0,
      crowns: 0,
      consecutivePerfectScores: 0
    };
  } finally {
    client.release();
  }
};

const getAllUsers = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users ORDER BY best_score DESC');
    
    const users = await Promise.all(result.rows.map(async (user) => {
      const attemptsResult = await client.query(
        'SELECT score, total_questions, date FROM quiz_attempts WHERE username = $1 ORDER BY date DESC',
        [user.username]
      );

      return {
        username: user.username,
        bestScore: user.best_score,
        attempts: attemptsResult.rows.map(a => ({
          score: a.score,
          totalQuestions: a.total_questions,
          date: a.date.toISOString()
        })),
        stars: user.stars,
        crowns: user.crowns,
        consecutivePerfectScores: user.consecutive_perfect_scores
      };
    }));

    return users;
  } finally {
    client.release();
  }
};

const saveAttempt = async (username, score, totalQuestions) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert attempt
    await client.query(
      'INSERT INTO quiz_attempts (username, score, total_questions) VALUES ($1, $2, $3)',
      [username, score, totalQuestions]
    );

    // Get user
    const userResult = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Calculate new stats
    const newBestScore = Math.max(user.best_score, score);
    const isPerfectScore = score === totalQuestions && totalQuestions > 0;
    
    let newStars = user.stars;
    let newCrowns = user.crowns;
    let newConsecutive = user.consecutive_perfect_scores;

    if (isPerfectScore) {
      newStars += 1;
      newConsecutive += 1;
      if (newConsecutive === 3) {
        newCrowns += 1;
        newConsecutive = 0;
      }
    } else {
      newConsecutive = 0;
    }

    // Update user
    await client.query(
      `UPDATE users 
       SET best_score = $1, stars = $2, crowns = $3, 
           consecutive_perfect_scores = $4, updated_at = NOW()
       WHERE username = $5`,
      [newBestScore, newStars, newCrowns, newConsecutive, username]
    );

    await client.query('COMMIT');

    // Return updated user
    return await getOrCreateUser(username);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const resetAllUsers = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Delete all attempts
    await client.query('DELETE FROM quiz_attempts');
    
    // Reset user stats but keep usernames
    await client.query(
      `UPDATE users SET 
       best_score = 0, stars = 0, crowns = 0, 
       consecutive_perfect_scores = 0, updated_at = NOW()`
    );
    
    await client.query('COMMIT');
    console.log('✅ Leaderboard reset successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  initDatabase,
  getOrCreateUser,
  getAllUsers,
  saveAttempt,
  resetAllUsers
};