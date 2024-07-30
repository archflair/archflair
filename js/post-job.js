// Ensure this matches the URL in your main script.js file
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFJpHlp9B0LaaUcDfkFqEDsRcb6W-f2oJigWSSmrp_AY5SP6WcyYM3d1VyLQF43nd4dg/exec';
const BUY_ME_A_COFFEE_URL = 'https://www.buymeacoffee.com/archflair/e/282884';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('jobPostForm');
  const previewBtn = document.getElementById('previewJobBtn');
  const submitBtn = document.getElementById('submitJobBtn');

  previewBtn.addEventListener('click', previewJob);
  form.addEventListener('submit', handleJobSubmission);
});

function previewJob(event) {
  event.preventDefault();
  const jobData = getJobDataFromForm();
  showJobPreview(jobData);
}

function handleJobSubmission(event) {
  event.preventDefault();
  const jobData = getJobDataFromForm();
  
  console.log('Sending job data:', jobData);
  const params = new URLSearchParams();
  params.append('action', 'addJob');
  params.append('jobData', JSON.stringify(jobData));

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: params,
    mode: 'no-cors'
  })
  .then(response => {
    console.log('Job submission response received');
    // Redirect to Buy Me a Coffee checkout
    window.location.href = BUY_ME_A_COFFEE_URL;
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while posting the job. Please try again. If the problem persists, contact support.');
  });
}

function getJobDataFromForm() {
  return {
    title: document.getElementById('jobTitle').value,
    company: document.getElementById('companyName').value,
    type: document.querySelector('input[name="jobType"]:checked').value,
    location: document.getElementById('jobLocation').value,
    keySkills: document.getElementById('keySkills').value,
    description: document.getElementById('jobDescription').value,
    website: document.getElementById('companyWebsite').value,
    email: document.getElementById('applicationEmail').value,
    salary: document.getElementById('salary').value,
    externalLink: document.getElementById('applicationUrl').value
  };
}

function showJobPreview(jobData) {
  const previewPopup = document.getElementById('jobPreviewPopup');
  previewPopup.style.display = 'flex';

  document.getElementById('previewJobTitle').textContent = `${jobData.title} at ${jobData.company}`;
  document.getElementById('previewJobType').textContent = jobData.type;
  document.getElementById('previewJobLocation').textContent = jobData.location;
  document.getElementById('previewJobSkills').textContent = jobData.keySkills;
  document.getElementById('previewJobDescription').textContent = jobData.description;
  
  const websiteElement = document.getElementById('previewJobWebsite');
  if (websiteElement) {
    websiteElement.textContent = jobData.website;
    websiteElement.href = jobData.website;
  }
  
  const emailElement = document.getElementById('previewJobEmail');
  if (emailElement) {
    emailElement.textContent = jobData.email;
    emailElement.href = `mailto:${jobData.email}`;
  }
  
  document.getElementById('previewJobSalary').textContent = jobData.salary || 'Not specified';
  
  const applyButton = document.getElementById('previewJobApply');
  if (applyButton) {
    applyButton.href = jobData.externalLink || `mailto:${jobData.email}`;
    applyButton.target = jobData.externalLink ? '_blank' : '';
  }
}

// Close the job preview popup
function closeJobPreview() {
  const jobPreviewPopup = document.getElementById('jobPreviewPopup');
  if (jobPreviewPopup) {
    jobPreviewPopup.style.display = 'none';
  }
}

// Add event listener for the close button
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('#jobPreviewPopup .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeJobPreview);
  }
});