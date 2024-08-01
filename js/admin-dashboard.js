// Replace with your Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykkRwWa2RjJbGe5t7N-yyzL52pV7WEzH9hCktyULLljMvqQdcxrZkUdUj0vRvlJcYgLQ/exec';

document.addEventListener('DOMContentLoaded', loadPendingJobs);

function loadPendingJobs() {
    fetch(`${SCRIPT_URL}?action=getPendingJobs`)
        .then(response => response.json())
        .then(jobs => {
            const pendingJobsDiv = document.getElementById('pendingJobs');
            pendingJobsDiv.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <h3>${job.Title} at ${job.Company}</h3>
                    <p><strong>Type:</strong> ${job.Type}</p>
                    <p><strong>Location:</strong> ${job.Location}</p>
                    <p><strong>Key Skills:</strong> ${job['Key Skills']}</p>
                    <p><strong>Description:</strong> ${job.Description}</p>
                    <p><strong>Salary:</strong> ${job.Salary || 'Not specified'}</p>
                    <p><strong>Website:</strong> <a href="${job.Website}" target="_blank">${job.Website}</a></p>
                    <p><strong>Email:</strong> <a href="mailto:${job.Email}">${job.Email}</a></p>
                    <p><strong>Payment Status:</strong> ${job['Payment Status']}</p>
                    <p><strong>Payment Date:</strong> ${job['Payment Date'] ? new Date(job['Payment Date']).toLocaleString() : 'Not paid'}</p>
                    ${job['Payment Status'] === 'Paid' ? `
                        <button onclick="approveJob('${job['Unique ID']}', true)">Approve</button>
                        <button onclick="approveJob('${job['Unique ID']}', false)">Reject</button>
                    ` : '<p>Awaiting payment</p>'}
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('pendingJobs').innerHTML = '<p>Error loading pending jobs. Please try refreshing the page.</p>';
        });
}

function approveJob(jobId, approved) {
    fetch(`${SCRIPT_URL}?action=approveJob&jobId=${jobId}&approved=${approved}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert(data.message);
            loadPendingJobs(); // Refresh the list
        } else {
            throw new Error(data.message || 'An error occurred');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    });
}