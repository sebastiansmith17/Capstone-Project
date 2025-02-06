// Redirect to the client info page when the "Next" button is clicked
document.getElementById('nextButton')?.addEventListener('click', function () {
    window.location.href = 'client-info.html';
  });
  
  // Handle form submission on the client info page
  document.getElementById('clientForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const companyName = document.getElementById('companyName').value;
    const employeeName = document.getElementById('employeeName').value;
    alert(`Company: ${companyName}, Employee: ${employeeName}`);
  });
