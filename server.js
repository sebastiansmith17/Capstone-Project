// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

// Initialize Express app
const app = express();
const PORT = 3000;

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Email sending function
async function sendConfirmationEmail(companyData, employees) {
  const mailOptions = {
    from: `"Client Submission System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `New Client Submission: ${companyData.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #2c3e50;">New Client Information Received</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #3498db; margin-top: 0;">Company Details</h2>
          <p><strong>Name:</strong> ${companyData.companyName}</p>
          <p><strong>Zipcode:</strong> ${companyData.companyZipcode}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h2 style="color: #3498db; margin-top: 0;">Employees (${employees.length})</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #3498db; color: white;">
                <th style="padding: 10px; text-align: left;">#</th>
                <th style="padding: 10px; text-align: left;">Name</th>
                <th style="padding: 10px; text-align: left;">Email</th>
                <th style="padding: 10px; text-align: left;">Birth Date</th>
                <th style="padding: 10px; text-align: left;">Hire Date</th>
                <th style="padding: 10px; text-align: left;">Dependents</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map((emp, index) => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px;">${index + 1}</td>
                  <td style="padding: 10px;">${emp.firstName} ${emp.lastName}</td>
                  <td style="padding: 10px;">${emp.email}</td>
                  <td style="padding: 10px;">${new Date(emp.birthDate).toLocaleDateString()}</td>
                  <td style="padding: 10px;">${new Date(emp.hireDate).toLocaleDateString()}</td>
                  <td style="padding: 10px;">${emp.dependents === 'yes' ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <p style="margin-top: 20px; color: #7f8c8d; font-size: 0.9em;">
          This information has been successfully saved to our database at ${new Date().toLocaleString()}.
        </p>
      </div>
    `,
    text: `New Client Submission\n\nCompany: ${companyData.companyName}\nZipcode: ${companyData.companyZipcode}\n\nEmployees:\n${employees.map((emp, i) => `${i+1}. ${emp.firstName} ${emp.lastName} (${emp.email})`).join('\n')}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

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
        -d '{"companyName":"Test","companyZipcode":"12345","employees":[{"firstName":"John","lastName":"Doe","email":"john@example.com","birthDate":"1990-01-01","hireDate":"2020-01-01","dependents":"yes"}]}'`
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
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: pool.pool.config.connectionConfig.database,
    emailService: !!transporter.options.auth.user
  });
});

// Form submission endpoint
app.post('/submit', async (req, res) => {
  const { companyName, companyZipcode, employees } = req.body;
  
  // Input validation
  if (!companyName || !companyZipcode || !employees || !Array.isArray(employees)) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: {
        companyName: 'string',
        companyZipcode: 'string',
        employees: 'array of employee objects'
      }
    });
  }

  // Validate each employee
  for (const [index, employee] of employees.entries()) {
    if (!employee.firstName || !employee.lastName || !employee.email || !employee.birthDate || !employee.hireDate) {
      return res.status(400).json({
        error: `Employee ${index + 1} missing required fields`,
        required: ['firstName', 'lastName', 'email', 'birthDate', 'hireDate']
      });
    }
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
          employee.dependents === 'yes' ? 1 : 0,
        ]
      );
    });

    await Promise.all(employeePromises);
    await connection.commit();

    // Send confirmation email
    await sendConfirmationEmail(
      { companyName, companyZipcode },
      employees
    );

    res.json({ 
      success: true,
      message: 'Data saved successfully and confirmation email sent',
      companyId: companyResult.insertId,
      employeeCount: employees.length
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
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
  res.status(500).json({ 
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`Email service: ${transporter.options.auth.user ? 'Configured' : 'Not configured'}`);
})
.on('error', (err) => {
  console.error('Server failed:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    pool.end();
    console.log('Server closed. Database pool ended.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    pool.end();
    console.log('Server closed. Database pool ended.');
    process.exit(0);
  });
});
