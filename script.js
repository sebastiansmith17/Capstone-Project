// Redirect to the client info page when the "Next" button is clicked
document.getElementById('nextButton')?.addEventListener('click', function () {
    window.location.href = 'client-info.html';
  });
  
  // Get references to the dropdown and employee fields container
  const employeeCountDropdown = document.getElementById('employeeCount');
  const employeeFieldsContainer = document.getElementById('employeeFields');
  
  // Function to generate employee input fields
  function generateEmployeeFields(count) {
    // Clear existing fields (except the header row)
    const headerRow = employeeFieldsContainer.querySelector('.header-row');
    employeeFieldsContainer.innerHTML = '';
    employeeFieldsContainer.appendChild(headerRow);
  
    for (let i = 1; i <= count; i++) {
      const employeeRow = document.createElement('div');
      employeeRow.classList.add('employee-row');
  
      employeeRow.innerHTML = `
        <div class="employee-number">${i}</div>
        <div class="field"><input type="text" id="firstName${i}" name="firstName${i}" required></div>
        <div class="field"><input type="text" id="lastName${i}" name="lastName${i}" required></div>
        <div class="field"><input type="date" id="birthDate${i}" name="birthDate${i}" required></div>
        <div class="field"><input type="email" id="email${i}" name="email${i}" required></div>
        <div class="field"><input type="date" id="hireDate${i}" name="hireDate${i}" required></div>
        <div class="field">
          <select id="dependents${i}" name="dependents${i}" required>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      `;
  
      employeeFieldsContainer.appendChild(employeeRow);
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
  document.getElementById('clientForm')?.addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from submitting the traditional way
  
    // Collect company information
    const companyName = document.getElementById('companyName').value;
    const companyZipcode = document.getElementById('companyZip').value;
  
    // Collect data for each employee
    const employeeCount = parseInt(employeeCountDropdown.value, 10);
    const employees = [];
  
    for (let i = 1; i <= employeeCount; i++) {
      const employee = {
        firstName: document.getElementById(`firstName${i}`).value,
        lastName: document.getElementById(`lastName${i}`).value,
        birthDate: document.getElementById(`birthDate${i}`).value,
        email: document.getElementById(`email${i}`).value,
        hireDate: document.getElementById(`hireDate${i}`).value,
        dependents: document.getElementById(`dependents${i}`).value,
      };
      employees.push(employee);
    }
  
    // Send data to the backend
    try {
        const response = await fetch('http://localhost:3000/submit', {  // Changed endpoint to /submit
          method: 'POST',
          mode: 'cors',  // Explicitly enable CORS
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            companyName, 
            companyZipcode, 
            employees 
          })
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Submission failed');
        }
    
        const result = await response.json();
        console.log('Success:', result);
        window.location.href = 'thank-you.html';
        
      } catch (error) {
        console.error('Error:', error);
        alert(`Submission error: ${error.message}`);
      }
    });
