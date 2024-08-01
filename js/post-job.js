const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnqAGnnUZyoF4nHCTjJchB4L0Vz5alXEXAcy5j_bHYVQv8GVjTcJleAwzfPANqpqxv5A/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('jobPostForm');
  const previewBtn = document.getElementById('previewJobBtn');
  const submitBtn = document.getElementById('submitJobBtn');
  const confirmationPopup = document.getElementById('confirmationPopup');
  const closeConfirmationBtn = document.getElementById('closeConfirmationBtn');

  previewBtn.addEventListener('click', previewJob);
  form.addEventListener('submit', handleJobSubmission);
  closeConfirmationBtn.addEventListener('click', closeConfirmationPopup);
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
    showConfirmationPopup();
    document.getElementById('jobPostForm').reset();
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
    applicationUrl: document.getElementById('applicationUrl').value
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
    applyButton.href = jobData.applicationUrl || `mailto:${jobData.email}`;
    applyButton.target = jobData.applicationUrl ? '_blank' : '';
  }
}

function closeJobPreview() {
  const jobPreviewPopup = document.getElementById('jobPreviewPopup');
  if (jobPreviewPopup) {
    jobPreviewPopup.style.display = 'none';
  }
}

function showConfirmationPopup() {
  const confirmationPopup = document.getElementById('confirmationPopup');
  confirmationPopup.style.display = 'flex';
}

function closeConfirmationPopup() {
  const confirmationPopup = document.getElementById('confirmationPopup');
  confirmationPopup.style.display = 'none';
}

// Add event listener for the close button in the preview popup
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('#jobPreviewPopup .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeJobPreview);
  }
});