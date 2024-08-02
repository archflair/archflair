// Replace with your Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz7mhWzmkH3lzmZe8l5W3T1l5ni_BclCW-ewS7sg2GeQ8dhslAmsq9os1gt1NwKCChmbw/exec';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  const form = document.getElementById('jobPostForm');
  const previewBtn = document.getElementById('previewJobBtn');
  const submitBtn = document.getElementById('submitJobBtn');

  if (previewBtn) {
    previewBtn.addEventListener('click', previewJob);
  } else {
    console.error('Preview button not found');
  }

  if (form) {
    form.addEventListener('submit', handleJobSubmission);
  } else {
    console.error('Job post form not found');
  }
});

function previewJob(event) {
  console.log('Preview job called');
  event.preventDefault();
  const jobData = getJobDataFromForm();
  showJobPreview(jobData);
}

function handleJobSubmission(event) {
  console.log('Handle job submission called');
  event.preventDefault();
  const jobData = getJobDataFromForm();
  
  console.log('Sending job data:', jobData);

  const params = new URLSearchParams();
  params.append('action', 'addJob');
  params.append('jobData', JSON.stringify(jobData));

  // Show loading indicator
  const submitBtn = document.getElementById('submitJobBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: params,
    mode: 'no-cors'
  })
  .then(response => {
    console.log('Job submission response received');
    alert('Job posted successfully! Please check your email for payment instructions.');
    document.getElementById('jobPostForm').reset();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while posting the job. Please try again. If the problem persists, contact support.');
  })
  .finally(() => {
    // Reset submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Job';
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
  console.log('Showing job preview');
  const previewPopup = document.getElementById('jobPreviewPopup');
  if (!previewPopup) {
    console.error('Job preview popup not found');
    return;
  }
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
  console.log('Closing job preview');
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
  } else {
    console.error('Close button for job preview not found');
  }
});