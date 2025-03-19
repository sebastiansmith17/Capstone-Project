const express = require('express');
const pool = require('./db'); // Import the database connection
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to handle form submissions
app.post('/submit', async (req, res) => {
  const { companyName, companyZipcode, employees } = req.body;

  try {
    // Insert company data
    const [companyResult] = await pool.query(
      'INSERT INTO companies (company_name, company_zipcode) VALUES (?, ?)',
      [companyName, companyZipcode]
    );

    const companyId = companyResult.insertId;

    // Insert employee data
    for (const employee of employees) {
      await pool.query(
        'INSERT INTO employees (company_id, first_name, last_name, birth_date, email, hire_date, dependents) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          companyId,
          employee.firstName,
          employee.lastName,
          employee.birthDate,
          employee.email,
          employee.hireDate,
          employee.dependents,
        ]
      );
    }

    res.json({ message: 'Data saved successfully!' });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
