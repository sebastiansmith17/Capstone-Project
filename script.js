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
            <label for="firstName${i}">First Name:</label>
            <input type="text" id="firstName${i}" name="firstName${i}" required>

            <label for="lastName${i}">Last Name:</label>
            <input type="text" id="lastName${i}" name="lastName${i}" required>

            <label for="birthDate${i}">Birth Date:</label>
            <input type="date" id="birthDate${i}" name="birthDate${i}" required>

            <label for="email${i}">Email:</label>
            <input type="text" id="email${i}" name="email${i}" required>

            <label for="hireDate${i}">Hire Date:</label>
            <input type="date" id="hireDate${i}" name="hireDate${i}" required>

            <label for="dependents${i}">Dependents (Y/N):</label>
            <input type="text" id="dependents${i}" name="dependents${i}" required>
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

    // Collect company data
    const companyName = document.getElementById('companyName').value.trim();
    const companyZip = document.getElementById('companyZip').value.trim();

    // Validation for company name
    if (!companyName) {
        alert('Please enter a company name.');
        return;
    }

    // Validation for company ZIP code (5 digits)
    const zipCodePattern = /^\d{5}$/;
    if (!zipCodePattern.test(companyZip)) {
        alert('Please enter a valid 5-digit ZIP code.');
        return;
    }

    // Collect data for each employee
    const employeeCount = parseInt(employeeCountDropdown.value, 10);
    const employees = [];

    for (let i = 1; i <= employeeCount; i++) {
        const employee = {
            companyName: companyName, // Add company name to each employee
            firstName: document.getElementById(`firstName${i}`).value,
            lastName: document.getElementById(`lastName${i}`).value,
            birthDate: document.getElementById(`birthDate${i}`).value,
            email: document.getElementById(`email${i}`).value,
            hireDate: document.getElementById(`hireDate${i}`).value,
            dependents: document.getElementById('dependents${i}').value,
        };
        employees.push(employee);
    }

    // Collect selected insurance options
    const insuranceOptions = [];
    const insuranceCheckboxes = document.querySelectorAll('input[name="insurance"]:checked');
    insuranceCheckboxes.forEach((checkbox) => {
        insuranceOptions.push(checkbox.value);
    });

    // Log the data (you can replace this with saving to a server or local storage)
    console.log('Company Name:', companyName);
    console.log('Company ZIP Code:', companyZip);
    console.log('Employees:', employees);
    console.log('Insurance Options:', insuranceOptions);

    // Redirect to the Thank You page
    window.location.href = 'thank-you.html';
});
