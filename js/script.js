// Global variables
let allJobs = [];
let fuse; // For fuzzy search
let currentPage = 1;
const jobsPerLoad = 9;
let loading = false;

// Replace with your Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxmrBpZ0dkHIUGRdRyFkvVawtUjmDrCr-HKa3TEPNVl_gJvzixCxRGAo5_LyfJMLyvmTg/exec';

// Wait for the DOM to be fully loaded before executing any scripts
document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
  setupEventListeners();
});

// Load jobs from Google Sheets
async function loadJobs() {
  try {
    console.log('Attempting to fetch jobs...');
    const response = await fetch(`${SCRIPT_URL}?action=getJobListings`);
    console.log('Fetch response:', response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const jobs = await response.json();
    console.log('Parsed jobs:', jobs);

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

// Set up event listeners
function setupEventListeners() {
  const searchBar = document.getElementById('searchBar');
  if (searchBar) {
    searchBar.addEventListener('input', filterJobs);
  }

  const jobList = document.getElementById('jobList');
  if (jobList) {
    jobList.addEventListener('click', handleJobInteraction);
  }

  setupUserInfoCapture();

  // Setup close button for job detail popup
  const closePopupBtn = document.querySelector('#jobDetailPopup .close');
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', closeJobDetailPopup);
  }
}

// Render jobs to the page
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
      <td>${job.Location}<a href="${job['External Link'] || `mailto:${job.Email}`}" class="apply-link" target="_blank">Apply</a></td>
    `;
    fragment.appendChild(jobRow);
  });

  tbody.appendChild(fragment);
}

// Handle job row interactions using event delegation
function handleJobInteraction(event) {
  const jobRow = event.target.closest('tr');
  if (!jobRow) return;

  const jobIndex = Array.from(jobRow.parentNode.children).indexOf(jobRow);
  const job = allJobs[jobIndex];

  if (event.target.classList.contains('apply-link')) {
    event.preventDefault();
    window.open(job['External Link'] || `mailto:${job.Email}`, '_blank');
  } else {
    showJobDetailPopup(job);
  }
}

// Display job details in a popup
function showJobDetailPopup(job) {
  const jobDetailPopup = document.getElementById('jobDetailPopup');
  if (!jobDetailPopup) {
    console.error('Job detail popup element not found');
    return;
  }
  jobDetailPopup.style.display = 'flex';

  // Populate job details
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

  // Set up the apply button
  const applyButton = document.getElementById('jobApply');
  if (applyButton) {
    applyButton.href = job['External Link'] || `mailto:${job.Email}`;
    applyButton.target = job['External Link'] ? '_blank' : '';
  }
}

// Close the job detail popup
function closeJobDetailPopup() {
  const jobDetailPopup = document.getElementById('jobDetailPopup');
  if (jobDetailPopup) {
    jobDetailPopup.style.display = 'none';
  }
}

// Filter jobs based on search input
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

// Set up infinite scroll
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

// Load more jobs for infinite scroll
function loadMoreJobs() {
  loading = true;
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
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
  }, 500); // Simulating network delay
}

// Set up user info capture functionality
function setupUserInfoCapture() {
  const button = document.getElementById('openUserInfo');
  const form = document.querySelector('.user-info-form');
  if (!button || !form) return;

  const inputs = form.querySelectorAll('input');
  const typeButtons = form.querySelectorAll('.type-button');
  let userType = '';

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    form.classList.toggle('active');
    if (form.classList.contains('active') && inputs.length > 0) {
      inputs[0].focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && e.target !== button) {
      form.classList.remove('active');
    }
  });

  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitUserInfo();
      }
    });
  });

  typeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      typeButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      userType = e.target.dataset.type;
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    });
  });

  function submitUserInfo() {
    const name = document.getElementById('userName')?.value;
    const email = document.getElementById('userEmail')?.value;

    if (name && email && userType) {
      console.log('User info:', { name, email, type: userType });
      alert(`Thanks, ${name}! We'll be in touch about ${userType} opportunities.`);
      form.classList.remove('active');
      inputs.forEach(input => input.value = '');
      typeButtons.forEach(btn => btn.classList.remove('active'));
      userType = '';
    } else {
      alert('Please fill in all fields.');
    }
  }
}

// Show error message
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
}