document.getElementById('clientForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const companyName = document.getElementById('companyName').value;
    const employeeName = document.getElementById('employeeName').value;
    const employeeEmail = document.getElementById('employeeEmail').value;

    // Create CSV content
    const csvContent = `data:text/csv;charset=utf-8,Company Name,Employee Name,Employee Email\n${companyName},${employeeName},${employeeEmail}`;

    // Create a link element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'client_info.csv');

    // Append to the document and trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear the form
    document.getElementById('clientForm').reset();
});