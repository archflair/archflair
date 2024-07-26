const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSmZAJ7ZvW6uHUYuBwA-1hdhnJKxlObtDtK6emSIYi7Q7b27bYs35T88b5C9DcnGzuUQ/exec';

document.addEventListener('DOMContentLoaded', () => {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin-login.html';
        return;
    }
    loadPendingJobs();
    loadAllJobs();
    setupEventListeners();
});

function isAdminLoggedIn() {
    return localStorage.getItem('adminToken') !== null;
}

function loadPendingJobs() {
    fetch(`${SCRIPT_URL}?action=getPendingJobs&adminToken=${localStorage.getItem('adminToken')}`)
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
                    <button onclick="approveJob('${job['Unique ID']}', true)">Approve</button>
                    <button onclick="approveJob('${job['Unique ID']}', false)">Reject</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

function loadAllJobs() {
    fetch(`${SCRIPT_URL}?action=getAllJobs&adminToken=${localStorage.getItem('adminToken')}`)
        .then(response => response.json())
        .then(jobs => {
            const allJobsDiv = document.getElementById('allJobs');
            allJobsDiv.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <h3>${job.Title} at ${job.Company}</h3>
                    <p><strong>Type:</strong> ${job.Type}</p>
                    <p><strong>Location:</strong> ${job.Location}</p>
                    <button onclick="editJob('${job['Unique ID']}')">Edit</button>
                    <button onclick="deleteJob('${job['Unique ID']}')">Delete</button>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

function approveJob(jobId, approved) {
    fetch(`${SCRIPT_URL}?action=approveJob&jobId=${jobId}&approved=${approved}&adminToken=${localStorage.getItem('adminToken')}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadPendingJobs();
        loadAllJobs();
    })
    .catch(error => console.error('Error:', error));
}

function editJob(jobId) {
    fetch(`${SCRIPT_URL}?action=getJob&jobId=${jobId}&adminToken=${localStorage.getItem('adminToken')}`)
        .then(response => response.json())
        .then(job => {
            document.getElementById('editJobTitle').value = job.Title;
            document.getElementById('editCompany').value = job.Company;
            document.getElementById('editLocation').value = job.Location;
            document.getElementById('editJobType').value = job.Type;
            document.getElementById('editKeySkills').value = job['Key Skills'];
            document.getElementById('editDescription').value = job.Description;
            document.getElementById('editSalary').value = job.Salary;
            document.getElementById('editEmail').value = job.Email;
            document.getElementById('editWebsite').value = job.Website;
            document.getElementById('editExternalLink').value = job['External Link'];
            
            document.getElementById('editJobForm').onsubmit = (e) => {
                e.preventDefault();
                saveJobChanges(jobId);
            };
            
            document.getElementById('editJobModal').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function saveJobChanges(jobId) {
    const updatedJob = {
        Title: document.getElementById('editJobTitle').value,
        Company: document.getElementById('editCompany').value,
        Location: document.getElementById('editLocation').value,
        Type: document.getElementById('editJobType').value,
        'Key Skills': document.getElementById('editKeySkills').value,
        Description: document.getElementById('editDescription').value,
        Salary: document.getElementById('editSalary').value,
        Email: document.getElementById('editEmail').value,
        Website: document.getElementById('editWebsite').value,
        'External Link': document.getElementById('editExternalLink').value
    };

    fetch(`${SCRIPT_URL}?action=updateJob&jobId=${jobId}&adminToken=${localStorage.getItem('adminToken')}`, {
        method: 'POST',
        body: JSON.stringify(updatedJob)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('editJobModal').style.display = 'none';
        loadAllJobs();
    })
    .catch(error => console.error('Error:', error));
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        fetch(`${SCRIPT_URL}?action=deleteJob&jobId=${jobId}&adminToken=${localStorage.getItem('adminToken')}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadAllJobs();
        })
        .catch(error => console.error('Error:', error));
    }
}

function setupEventListeners() {
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });

    document.querySelector('#editJobModal .close').addEventListener('click', () => {
        document.getElementById('editJobModal').style.display = 'none';
    });
}