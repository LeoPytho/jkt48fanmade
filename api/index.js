const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://valzyy:_aZGK-UPaPUEsHuYnayfEA@dashboard-8638.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/restapi?sslmode=verify-full',
  ssl: {
    rejectUnauthorized: false
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Initialize database tables
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        member_number VARCHAR(20) UNIQUE NOT NULL,
        api_key VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        type VARCHAR(50) DEFAULT 'regular',
        oshi VARCHAR(255) DEFAULT 'none',
        barcode TEXT,
        balance DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Generate member number
function generateMemberNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `JC4${timestamp.slice(-6)}${random}`;
}

// Generate API Key with JC prefix
function generateApiKey() {
  const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase();
  const formatted = randomBytes.match(/.{1,4}/g).join('-');
  return `JC-${formatted}`;
}

// Generate Code 128 Barcode
function generateCode128Barcode(data) {
  try {
    const canvas = createCanvas(400, 100);
    const ctx = canvas.getContext('2d');
    
    // Set background to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate barcode
    JsBarcode(canvas, data, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 12,
      textMargin: 5,
      margin: 10
    });
    
    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating Code 128 barcode:', error);
    return null;
  }
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, phone } = req.body;

    // Validate input
    if (!email || !username || !password || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate member data
    const memberNumber = generateMemberNumber();
    const apiKey = generateApiKey();
    
    // Generate Code 128 barcode using member number
    const barcode = generateCode128Barcode(memberNumber);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, username, password, phone, member_number, api_key, status, type, oshi, barcode, balance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, email, username, phone, member_number, api_key, status, type, oshi, balance`,
      [email, username, hashedPassword, phone, memberNumber, apiKey, 'active', 'regular', 'none', barcode, 0.00]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        memberNumber: user.member_number,
        apiKey: user.api_key,
        status: user.status,
        type: user.type,
        oshi: user.oshi,
        balance: user.balance,
        barcode: barcode
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        memberNumber: user.member_number,
        apiKey: user.api_key,
        status: user.status,
        type: user.type,
        oshi: user.oshi,
        balance: user.balance,
        barcode: user.barcode
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, username, phone, member_number, api_key, status, type, oshi, balance, barcode FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        memberNumber: user.member_number,
        apiKey: user.api_key,
        status: user.status,
        type: user.type,
        oshi: user.oshi,
        balance: user.balance,
        barcode: user.barcode
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile endpoint
app.put('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { username, phone, oshi } = req.body;

    const result = await pool.query(
      'UPDATE users SET username = $1, phone = $2, oshi = $3 WHERE id = $4 RETURNING id, email, username, phone, member_number, api_key, status, type, oshi, balance, barcode',
      [username, phone, oshi, decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        memberNumber: user.member_number,
        apiKey: user.api_key,
        status: user.status,
        type: user.type,
        oshi: user.oshi,
        balance: user.balance,
        barcode: user.barcode
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Regenerate API Key endpoint
app.post('/api/regenerate-apikey', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const newApiKey = generateApiKey();

    const result = await pool.query(
      'UPDATE users SET api_key = $1 WHERE id = $2 RETURNING api_key',
      [newApiKey, decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'API Key regenerated successfully',
      apiKey: result.rows[0].api_key
    });

  } catch (error) {
    console.error('API Key regeneration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Key authentication middleware
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API Key required' });
  }

  pool.query('SELECT * FROM users WHERE api_key = $1', [apiKey])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid API Key' });
      }
      req.user = result.rows[0];
      next();
    })
    .catch(error => {
      console.error('API Key authentication error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
}

// API endpoint that requires API Key
app.get('/api/user-data', authenticateApiKey, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      message: 'User data retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        memberNumber: user.member_number,
        status: user.status,
        type: user.type,
        oshi: user.oshi,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('User data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new barcode endpoint
app.post('/api/regenerate-barcode', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user's member number
    const userResult = await pool.query(
      'SELECT member_number FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const memberNumber = userResult.rows[0].member_number;
    const newBarcode = generateCode128Barcode(memberNumber);

    // Update barcode in database
    const result = await pool.query(
      'UPDATE users SET barcode = $1 WHERE id = $2 RETURNING barcode',
      [newBarcode, decoded.userId]
    );

    res.json({
      message: 'Barcode regenerated successfully',
      barcode: result.rows[0].barcode
    });

  } catch (error) {
    console.error('Barcode regeneration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected successfully', time: result.rows[0].now });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Initialize database when server starts
initializeDatabase();

// For Vercel, export the app
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
