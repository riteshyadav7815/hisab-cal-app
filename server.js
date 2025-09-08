require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable not set.');
    process.exit(1);
}

// Database setup with PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Heroku/Render connections
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Function to create tables if they don't exist
const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS friends (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                UNIQUE(user_id, name)
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                friend_id INTEGER NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                reason TEXT NOT NULL,
                date TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('Tables are successfully created or already exist.');
    } catch (err) {
        console.error('Error creating tables:', err.stack);
    } finally {
        client.release();
    }
};

// Basic route to check if server is running
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Hisab Calculator API!' });
});

// --- AUTHENTICATION ROUTES ---

// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id';
        const { rows } = await pool.query(sql, [username, hashedPassword]);
        res.status(201).json({ message: 'User created successfully', userId: rows[0].id });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Username already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await pool.query(sql, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- MIDDLEWARE TO PROTECT ROUTES ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API ROUTES FOR FRIENDS ---

app.get('/api/friends', authenticateToken, async (req, res) => {
    try {
        const sql = 'SELECT name FROM friends WHERE user_id = $1';
        const { rows } = await pool.query(sql, [req.user.id]);
        const friends = rows.map(row => row.name);
        res.json(friends);
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Failed to retrieve friends' });
    }
});

app.post('/api/friends', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Friend name is required' });
    }

    try {
        const sql = 'INSERT INTO friends (user_id, name) VALUES ($1, $2) RETURNING id';
        const { rows } = await pool.query(sql, [req.user.id, name]);
        res.status(201).json({ message: 'Friend added successfully', friendId: rows[0].id });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Friend already exists' });
        }
        console.error('Add friend error:', error);
        res.status(500).json({ error: 'Failed to add friend' });
    }
});

app.delete('/api/friends/:name', authenticateToken, async (req, res) => {
    const { name: friendName } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        // Note: In PostgreSQL, we don't need to get the ID first if we set up ON DELETE CASCADE
        // The friend_id in transactions will be deleted automatically when the friend is deleted.
        const deleteFriendSql = 'DELETE FROM friends WHERE user_id = $1 AND name = $2';
        const result = await client.query(deleteFriendSql, [req.user.id, friendName]);

        if (result.rowCount === 0) {
            throw new Error('Friend not found');
        }

        await client.query('COMMIT');
        res.json({ message: 'Friend and their transactions deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Delete friend error:', error);
        if (error.message === 'Friend not found') {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.status(500).json({ error: 'Failed to delete friend' });
    } finally {
        client.release();
    }
});

// --- API ROUTES FOR NOTIFICATIONS ---

app.get('/api/notifications', authenticateToken, async (req, res) => {
    const sql = `
        SELECT id, message, is_read, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC`;
    try {
        const { rows } = await pool.query(sql, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// --- API ROUTES FOR TRANSACTIONS ---

app.get('/api/transactions', authenticateToken, async (req, res) => {
    const sql = `
        SELECT t.id, f.name as friend, t.type, t.amount, t.reason, t.date 
        FROM transactions t
        JOIN friends f ON t.friend_id = f.id
        WHERE t.user_id = $1
        ORDER BY t.date DESC`;
    try {
        const { rows } = await pool.query(sql, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { friend: friendName, type, amount, reason } = req.body;
    if (!friendName || !type || !amount || !reason) {
        return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const getFriendIdSql = 'SELECT id FROM friends WHERE user_id = $1 AND name = $2';
        const friendResult = await client.query(getFriendIdSql, [req.user.id, friendName]);
        const friend = friendResult.rows[0];

        if (!friend) {
            throw new Error('Friend not found');
        }

        const transactionSql = 'INSERT INTO transactions (user_id, friend_id, type, amount, reason) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const { rows } = await client.query(transactionSql, [req.user.id, friend.id, type, amount, reason]);

        // Create a notification
        let message = '';
        if (type === 'expense') {
            message = `New expense logged: You paid ${friendName} ₹${amount} for "${reason}".`;
        } else if (type === 'income') {
            message = `New income logged: ${friendName} paid you ₹${amount} for "${reason}".`;
        } else {
            message = `New settlement logged with ${friendName} of ₹${amount}.`;
        }
        const notificationSql = 'INSERT INTO notifications (user_id, message) VALUES ($1, $2)';
        await client.query(notificationSql, [req.user.id, message]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Transaction added successfully', transactionId: rows[0].id });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Add transaction error:', error);
        if (error.message === 'Friend not found') {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.status(500).json({ error: 'Failed to add transaction' });
    } finally {
        client.release();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Create tables on startup
    createTables();
});
