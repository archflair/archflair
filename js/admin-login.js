const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwO3TUkU0s54h8qQbsoX4P3HjRD8x0sAukrpQMMoZc-pM7_8XxZxUctigDVfVQDudQ4aA/exec';

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
            throw new Error(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message || 'An error occurred. Please try again.');
    });
});