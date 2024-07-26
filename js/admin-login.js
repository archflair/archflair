const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyCYCehIJCr3EZCW40zRgegzHsim2jj1nP4CcjeA2CnG9SK_MNGQKBqBfvBz_OTW6z56Q/exec';

document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    console.log('Attempting to login with:', email);

    fetch(`${SCRIPT_URL}?action=adminLogin&origin=${encodeURIComponent(window.location.origin)}`, {
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