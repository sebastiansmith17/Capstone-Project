// Redirect to the client info page when the "Next" button is clicked
document.getElementById('nextButton')?.addEventListener('click', function () {
    window.location.href = 'client-info.html';
  });
  
  // Get references to the dropdown and employee fields container
  const employeeCountDropdown = document.getElementById('employeeCount');
  const employeeFieldsContainer = document.getElementById('employeeFields');
  
  // Function to generate employee input fields
  function generateEmployeeFields(count) {
    employeeFieldsContainer.innerHTML = ''; // Clear existing fields
  
    for (let i = 1; i <= count; i++) {
      const employeeDiv = document.createElement('div');
      employeeDiv.classList.add('employee');
  
      employeeDiv.innerHTML = `
        <h3>Employee ${i}</h3>
        <label for="companyName${i}">Company Name:</label>
        <input type="text" id="companyName${i}" name="companyName${i}" required>
  
        <label for="firstName${i}">First Name:</label>
        <input type="text" id="firstName${i}" name="firstName${i}" required>
  
        <label for="lastName${i}">Last Name:</label>
        <input type="text" id="lastName${i}" name="lastName${i}" required>
  
        <label for="birthDate${i}">Birth Date:</label>
        <input type="date" id="birthDate${i}" name="birthDate${i}" required>
  
        <label for="ssn${i}">SSN:</label>
        <input type="text" id="ssn${i}" name="ssn${i}" required>
  
        <label for="hireDate${i}">Hire Date:</label>
        <input type="date" id="hireDate${i}" name="hireDate${i}" required>
      `;
  
      employeeFieldsContainer.appendChild(employeeDiv);
    }
  }
  
  // Event listener for the dropdown
  employeeCountDropdown?.addEventListener('change', function () {
    const selectedCount = parseInt(employeeCountDropdown.value, 10);
    if (selectedCount >= 2 && selectedCount <= 10) {
      generateEmployeeFields(selectedCount);
    }
  });
  
  // Handle form submission on the client info page
  document.getElementById('clientForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting the traditional way
  
    // Collect data for each employee
    const employeeCount = parseInt(employeeCountDropdown.value, 10);
    const employees = [];
  
    for (let i = 1; i <= employeeCount; i++) {
      const employee = {
        companyName: document.getElementById(`companyName${i}`).value,
        firstName: document.getElementById(`firstName${i}`).value,
        lastName: document.getElementById(`lastName${i}`).value,
        birthDate: document.getElementById(`birthDate${i}`).value,
        ssn: document.getElementById(`ssn${i}`).value,
        hireDate: document.getElementById(`hireDate${i}`).value,
      };
      employees.push(employee);
    }
  
    // Log the data (you can replace this with saving to a server or local storage)
    console.log('Employees:', employees);
  
    // Redirect to the Thank You page
    window.location.href = 'thank-you.html';
  });
