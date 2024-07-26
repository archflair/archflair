const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxAKLehT0gvQnPA4luhN5PHFqfhJXFQD3LvifO2hIjpfA6vyYdh7cjuhNZ8uCebDN3UA/exec';

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    fetch(`${SCRIPT_URL}?action=adminLogin`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Login failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});