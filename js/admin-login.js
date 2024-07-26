const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTm_NI5Z0YPF0r7XiT7tXcO85bugwhKjabY0aibP-ghd-BKGRltgAAR3iQBseAWO0ZWw/exec';

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    console.log('Attempting to login with:', email);

    fetch(`${SCRIPT_URL}?action=adminLogin`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.status === 'success') {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin-dashboard.html';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
});