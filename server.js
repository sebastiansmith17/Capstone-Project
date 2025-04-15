require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

// Initialize Express app
const app = express();
const PORT = 3000; // Explicit port declaration

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
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middleware in correct order
app.use(cors(corsOptions)); // Regular requests
app.options('*', cors(corsOptions)); // Preflight requests
app.use(express.json()); // Enable JSON body parsing

// Routes
app.get('/', (req, res) => {
  console.log(`📊 Root route accessed | IP: ${req.ip} | Time: ${new Date().toISOString()}`);
  
  const apiEndpoints = [
    {
      method: 'GET',
      path: '/health',
      description: 'Server health status',
      example: 'curl http://localhost:3000/health'
    },
    {
      method: 'POST',
      path: '/submit',
      description: 'Submit client/employee data',
      example: `curl -X POST http://localhost:3000/submit \\
        -H "Content-Type: application/json" \\
        -d '{"companyName":"Test","employees":[{"firstName":"John"}]}'`
    }
  ];

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Client API Documentation</title>
      <style>
        :root {
          --color-get: #2ecc71;
          --color-post: #e67e22;
          --color-bg: #f8f9fa;
          --color-text: #2c3e50;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 2rem;
          color: var(--color-text);
          max-width: 800px;
          margin: 0 auto;
        }
        .method {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          font-family: monospace;
          margin-right: 0.5rem;
        }
        .method-get { background: var(--color-get); color: white; }
        .method-post { background: var(--color-post); color: white; }
        .endpoint {
          background: white;
          padding: 1rem;
          margin: 1rem 0;
          border-left: 4px solid #3498db;
        }
        footer {
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <h1>Client Information API</h1>
      <p>Server is running at ${new Date().toLocaleString()}</p>

      <h2>Available Endpoints</h2>
      ${apiEndpoints.map(endpoint => `
        <div class="endpoint">
          <div>
            <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <strong>${endpoint.path}</strong>
          </div>
          <p>${endpoint.description}</p>
          ${endpoint.method === 'GET' ? `<a href="${endpoint.path}">Test Endpoint</a>` : ''}
        </div>
      `).join('')}

      <footer>
        ℹ️ Add <code>?debug=1</code> to any URL for detailed output
      </footer>
    </body>
    </html>
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

// Error handling middleware (MUST be after routes but before server startup)
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

// Start server (ONCE)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
})
.on('error', (err) => {
  console.error('Server failed:', err);
});
