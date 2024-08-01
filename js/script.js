// Global variables
let allJobs = [];
let fuse; // For fuzzy search
let currentPage = 1;
const jobsPerLoad = 9;
let loading = false;

// Replace with your Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyUlKaWPfXi7lRBmQx8EYjkETc9JBtVA-zt5wbiuIrD9S5pmn3mmNhjyOSTEL-PbKtBQ/exec';

document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupEventListeners();
});

async function loadJobs() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getJobListings`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jobs = await response.json();
        allJobs = jobs;

        // Initialize fuzzy search
        fuse = new Fuse(allJobs, {
            keys: ['Title', 'Company', 'Type', 'Location'],
            threshold: 0.3,
        });

        // Render initial set of jobs
        renderJobs(allJobs.slice(0, jobsPerLoad));

        // Set up infinite scroll after initial render
        setupInfiniteScroll();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showErrorMessage(`Unable to load jobs. Error: ${error.message}`);
    }
}

function setupEventListeners() {
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        searchBar.addEventListener('input', filterJobs);
    }

    const jobList = document.getElementById('jobList');
    if (jobList) {
        jobList.addEventListener('click', handleJobInteraction);
    }

    // Setup close button for job detail popup
    const closePopupBtn = document.querySelector('#jobDetailPopup .close');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closeJobDetailPopup);
    }
}

function renderJobs(jobs, append = false) {
    const jobList = document.getElementById('jobList');
    if (!jobList) {
        console.error('Job list element not found');
        return;
    }
    
    const tbody = jobList.querySelector('tbody');
    
    if (!append) {
        tbody.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    jobs.forEach((job) => {
        const jobRow = document.createElement('tr');
        jobRow.innerHTML = `
            <td>${job.Title}</td>
            <td>${job.Company}</td>
            <td>${job.Type}</td>
            <td>${job.Location}<a href="#" class="apply-link" data-job-id="${job['Unique ID']}">Apply</a></td>
        `;
        fragment.appendChild(jobRow);
    });

    tbody.appendChild(fragment);
}

function handleJobInteraction(event) {
    if (event.target.classList.contains('apply-link')) {
        event.preventDefault();
        const jobId = event.target.getAttribute('data-job-id');
        const job = allJobs.find(j => j['Unique ID'] === jobId);
        if (job) {
            showJobDetailPopup(job);
        }
    }
}

function showJobDetailPopup(job) {
    const jobDetailPopup = document.getElementById('jobDetailPopup');
    if (!jobDetailPopup) {
        console.error('Job detail popup element not found');
        return;
    }
    jobDetailPopup.style.display = 'flex';

    document.getElementById('jobTitle').textContent = `${job.Title} at ${job.Company}`;
    document.getElementById('jobType').textContent = job.Type;
    document.getElementById('jobLocation').textContent = job.Location;
    document.getElementById('jobKeySkills').textContent = job['Key Skills'];
    document.getElementById('jobDescription').textContent = job.Description;
    
    const websiteElement = document.getElementById('jobWebsite');
    if (websiteElement) {
        websiteElement.textContent = job.Website;
        websiteElement.href = job.Website;
    }
    
    const emailElement = document.getElementById('jobEmail');
    if (emailElement) {
        emailElement.textContent = job.Email;
        emailElement.href = `mailto:${job.Email}`;
    }
    
    document.getElementById('jobSalary').textContent = job.Salary || 'Not specified';

    const applyButton = document.getElementById('jobApply');
    if (applyButton) {
        applyButton.href = job['External Link'] || `mailto:${job.Email}`;
        applyButton.target = job['External Link'] ? '_blank' : '';
    }
}

function closeJobDetailPopup() {
    const jobDetailPopup = document.getElementById('jobDetailPopup');
    if (jobDetailPopup) {
        jobDetailPopup.style.display = 'none';
    }
}

function filterJobs(event) {
    const searchTerm = event.target.value.trim();

    if (searchTerm === '') {
        renderJobs(allJobs.slice(0, jobsPerLoad));
        return;
    }

    const results = fuse.search(searchTerm);
    const filteredJobs = results.map(result => result.item);
    renderJobs(filteredJobs);
}

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (loading) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const scrollThreshold = document.body.offsetHeight - 200;

        if (scrollPosition >= scrollThreshold) {
            loadMoreJobs();
        }
    });
}

function loadMoreJobs() {
    loading = true;
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    setTimeout(() => {
        const startIndex = currentPage * jobsPerLoad;
        const endIndex = startIndex + jobsPerLoad;
        const newJobs = allJobs.slice(startIndex, endIndex);

        renderJobs(newJobs, true);
        
        loading = false;
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        currentPage++;
    }, 500);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}