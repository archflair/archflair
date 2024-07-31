// Ensure this matches the URL in your main script.js file
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNlgTN3cxy8FYkk5HTdvefEM8g3DfhWnXMLAG6iTL-ZPI6k1UdLyU_A2Lv4W6vANjs1Q/exec';

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

async function handleJobSubmission(event) {
  event.preventDefault();
  const jobData = getJobDataFromForm();
  
  try {
    const response = await fetch(`${SCRIPT_URL}?action=addJob`, {
      method: 'POST',
      body: new URLSearchParams({jobData: JSON.stringify(jobData)}),
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      showJobSummary(jobData, data.jobId);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function showJobSummary(jobData, jobId) {
  const form = document.getElementById('jobPostForm');
  form.style.display = 'none';

  const summary = document.createElement('div');
  summary.id = 'jobSummary';
  summary.innerHTML = `
    <h2>Job Posting Summary</h2>
    <p><strong>Title:</strong> ${jobData.title}</p>
    <p><strong>Company:</strong> ${jobData.company}</p>
    <p><strong>Location:</strong> ${jobData.location}</p>
    <p><strong>Type:</strong> ${jobData.type}</p>
    <button id="proceedToPayment">Proceed to Payment</button>
  `;
  
  form.parentNode.insertBefore(summary, form.nextSibling);
  
  document.getElementById('proceedToPayment').addEventListener('click', () => {
    // Replace with your actual Buy Me a Coffee checkout link
    window.location.href = `https://www.buymeacoffee.com/archflair/e/282884';
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