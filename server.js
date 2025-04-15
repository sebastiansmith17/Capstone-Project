require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'user',
  password: 'Incorrect03!',
  database: 'client_info',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://sebastiansmith17.github.io/Capstone-Project/'
];

const corsOptions = {
    origin: allowedOrigins, // Or your array of allowed origins
    methods: ['GET', 'POST', 'OPTIONS'], // Explicit methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  };

// Apply middleware in correct order
app.use(cors(corsOptions)); // Regular requests
app.options('*', cors(corsOptions)); // Preflight requests
//app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>Client Information API</h1>
    <p>CORS-enabled endpoints:</p>
    <ul>
      <li><a href="/health">/health</a></li>
      <li>POST /submit</li>
    </ul>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Form submission endpoint
app.post('/submit', async (req, res) => {
  // Input validation
  const { companyName, companyZipcode, employees } = req.body;
  
  if (!companyName || !companyZipcode || !employees) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['companyName', 'companyZipcode', 'employees']
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert company
    const [companyResult] = await connection.query(
      'INSERT INTO companies (company_name, company_zipcode) VALUES (?, ?)',
      [companyName, companyZipcode]
    );

    // Insert employees
    const employeePromises = employees.map(employee => {
      return connection.query(
        'INSERT INTO employees (company_id, first_name, last_name, birth_date, email, hire_date, dependents) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          companyResult.insertId,
          employee.firstName,
          employee.lastName,
          employee.birthDate,
          employee.email,
          employee.hireDate,
          employee.dependents || 0,
        ]
      );
    });

    await Promise.all(employeePromises);
    await connection.commit();

    res.json({ 
      success: true,
      message: 'Data saved successfully',
      companyId: companyResult.insertId
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Database error:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Policy Violation',
      allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }
  
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
