const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Login / Create User
app.post('/api/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await db.getOrCreateUser(username.trim());
    res.json(user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 2. Get All Users (Leaderboard)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// 3. Save Quiz Attempt
app.post('/api/users/:username/attempts', async (req, res) => {
  try {
    const { username } = req.params;
    const { score, totalQuestions } = req.body;

    if (typeof score !== 'number' || typeof totalQuestions !== 'number') {
      return res.status(400).json({ error: 'Invalid attempt data' });
    }

    const updatedUser = await db.saveAttempt(username, score, totalQuestions);
    res.json(updatedUser);
  } catch (error) {
    console.error('Save attempt error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Server error saving attempt' });
  }
});

// 4. Reset Leaderboard
app.delete('/api/users', async (req, res) => {
  try {
    await db.resetAllUsers();
    res.status(204).send();
  } catch (error) {
    console.error('Reset leaderboard error:', error);
    res.status(500).json({ error: 'Server error resetting leaderboard' });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    await db.initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Concrete Quiz API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();