// Replace with your Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXgU8ZJncTi0lf3Ujw8ap-70ZjP49PdfR2elnrE0pl1C0nKpbsnMC754vlf7vwRWrdmw/exec';

document.addEventListener('DOMContentLoaded', loadPendingJobs);

function loadPendingJobs() {
    fetch(`${SCRIPT_URL}?action=getPendingJobs`)
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                const pendingJobsDiv = document.getElementById('pendingJobs');
                if (result.data.length === 0) {
                    pendingJobsDiv.innerHTML = '<p>No pending jobs to approve.</p>';
                } else {
                    pendingJobsDiv.innerHTML = result.data.map(job => `
                        <div class="job-card">
                            <h3>${job.Title} at ${job.Company}</h3>
                            <p>Location: ${job.Location}</p>
                            <p>Type: ${job.Type}</p>
                            <p>Payment Status: ${job['Payment Status']}</p>
                            <button onclick="approveJob('${job['Unique ID']}', true)">Approve</button>
                            <button onclick="approveJob('${job['Unique ID']}', false)">Reject</button>
                        </div>
                    `).join('');
                }
            } else {
                throw new Error(result.message || 'Failed to load pending jobs');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('pendingJobs').innerHTML = '<p>Error loading pending jobs. Please try again.</p>';
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