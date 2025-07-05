const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://valzyy:_aZGK-UPaPUEsHuYnayfEA@dashboard-8638.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/restapi?sslmode=verify-full',
  ssl: {
    rejectUnauthorized: false
  }
});

// Create tables if they don't exist
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nomor_hp VARCHAR(20) NOT NULL,
        nomor_anggota VARCHAR(20) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        jenis VARCHAR(50) DEFAULT 'member',
        oshi VARCHAR(255) DEFAULT '',
        barcode VARCHAR(255) DEFAULT '',
        saldo DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database on startup
initDatabase();

// Generate member number
function generateMemberNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MBR${timestamp}${random}`;
}

// Generate barcode
function generateBarcode(memberNumber) {
  return `BC${memberNumber}${Date.now().toString().slice(-4)}`;
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, nomor_hp, oshi = '' } = req.body;

    // Validate input
    if (!email || !username || !password || !nomor_hp) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email atau username sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate member data
    const nomorAnggota = generateMemberNumber();
    const barcode = generateBarcode(nomorAnggota);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, username, password, nomor_hp, nomor_anggota, barcode, oshi) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [email, username, hashedPassword, nomor_hp, nomorAnggota, barcode, oshi]
    );

    const user = result.rows[0];
    delete user.password;

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    delete user.password;

    res.json({
      message: 'Login berhasil',
      token: token,
      user: user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get user profile endpoint
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = result.rows[0];
    delete user.password;

    res.json(user);

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Token tidak valid' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve Vue app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
