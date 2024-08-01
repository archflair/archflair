// Ensure this matches the URL of your Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyUlKaWPfXi7lRBmQx8EYjkETc9JBtVA-zt5wbiuIrD9S5pmn3mmNhjyOSTEL-PbKtBQ/exec';

// Replace with your actual Gumroad product link
const GUMROAD_LINK = 'https://archflair.gumroad.com/l/henql';

let currentJobId = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('jobPostForm');
    const previewBtn = document.getElementById('previewJobBtn');
    const submitBtn = document.getElementById('submitJobBtn');

    previewBtn.addEventListener('click', previewJob);
    form.addEventListener('submit', handleJobSubmission);

    // Set up Gumroad overlay callback
    if (typeof Gumroad !== 'undefined') {
        Gumroad.setConfig({
            success_callback: handleGumroadSuccess
        });
    } else {
        console.error('Gumroad script not loaded properly');
    }

    // Setup close buttons for popups
    const closePreviewBtn = document.querySelector('#jobPreviewPopup .close');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closeJobPreview);
    }

    const closeConfirmationBtn = document.querySelector('#confirmationPopup .close');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmationPopup);
    }
});

function previewJob(event) {
    event.preventDefault();
    const jobData = getJobDataFromForm();
    if (validateJobData(jobData)) {
        showJobPreview(jobData);
    }
}

function handleJobSubmission(event) {
    event.preventDefault();
    const jobData = getJobDataFromForm();
    
    if (!validateJobData(jobData)) {
        return;
    }

    const params = new URLSearchParams();
    params.append('action', 'addJob');
    params.append('jobData', JSON.stringify(jobData));

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentJobId = data.jobId;
            console.log('Current Job ID:', currentJobId); // For debugging
            showConfirmationPopup(data.jobId);
        } else {
            alert('An error occurred while posting the job. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while posting the job. Please try again.');
    });
}

function getJobDataFromForm() {
    return {
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('companyName').value,
        location: document.getElementById('jobLocation').value,
        type: document.querySelector('input[name="jobType"]:checked')?.value,
        keySkills: document.getElementById('keySkills').value,
        description: document.getElementById('jobDescription').value,
        salary: document.getElementById('salary').value,
        email: document.getElementById('applicationEmail').value,
        applicationUrl: document.getElementById('applicationUrl').value,
        website: document.getElementById('companyWebsite').value
    };
}

function validateJobData(jobData) {
    let isValid = true;
    let errorMessage = '';

    if (!jobData.title) {
        errorMessage += 'Job title is required.\n';
        isValid = false;
    }
    if (!jobData.company) {
        errorMessage += 'Company name is required.\n';
        isValid = false;
    }
    if (!jobData.location) {
        errorMessage += 'Job location is required.\n';
        isValid = false;
    }
    if (!jobData.type) {
        errorMessage += 'Job type is required.\n';
        isValid = false;
    }
    if (!jobData.keySkills) {
        errorMessage += 'Key skills are required.\n';
        isValid = false;
    }
    if (!jobData.description) {
        errorMessage += 'Job description is required.\n';
        isValid = false;
    }
    if (!jobData.email) {
        errorMessage += 'Application email is required.\n';
        isValid = false;
    }

    if (!isValid) {
        alert('Please correct the following errors:\n\n' + errorMessage);
    }

    return isValid;
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
        websiteElement.textContent = jobData.website || 'Not provided';
        websiteElement.href = jobData.website || '#';
    }
    
    document.getElementById('previewJobEmail').textContent = jobData.email;
    document.getElementById('previewJobSalary').textContent = jobData.salary || 'Not specified';
    
    const applyButton = document.getElementById('previewJobApply');
    if (applyButton) {
        applyButton.href = jobData.applicationUrl || `mailto:${jobData.email}`;
        applyButton.target = jobData.applicationUrl ? '_blank' : '';
    }
}

function showConfirmationPopup(jobId) {
    const confirmationPopup = document.getElementById('confirmationPopup');
    confirmationPopup.style.display = 'flex';

    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
    const gumroadLink = `${GUMROAD_LINK}?wanted=true&jobId=${jobId}`;
    
    proceedToPaymentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmationPopup.style.display = 'none';
        
        // Use Gumroad.createOverlay to open the Gumroad checkout
        Gumroad.createOverlay(gumroadLink);
    });

    // Update the href attribute (as a fallback)
    proceedToPaymentBtn.href = gumroadLink;
}

function closeJobPreview() {
    const jobPreviewPopup = document.getElementById('jobPreviewPopup');
    if (jobPreviewPopup) {
        jobPreviewPopup.style.display = 'none';
    }
}

function closeConfirmationPopup() {
    const confirmationPopup = document.getElementById('confirmationPopup');
    if (confirmationPopup) {
        confirmationPopup.style.display = 'none';
    }
}

function handleGumroadSuccess(data) {
    console.log('Gumroad payment successful:', data);
    
    // Extract jobId from the data if available, or use the stored currentJobId
    const jobId = data.jobId || currentJobId;
    
    if (!jobId) {
        console.error('No job ID available');
        alert('An error occurred. Please contact support.');
        return;
    }
    
    // Update payment status in the backend
    const params = new URLSearchParams();
    params.append('action', 'updatePaymentStatus');
    params.append('jobId', jobId);
    params.append('paymentStatus', 'Paid');

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Thank you for your payment. Your job posting will be reviewed shortly.');
            document.getElementById('jobPostForm').reset();
        } else {
            alert('An error occurred while updating the payment status. Please contact support.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the payment status. Please contact support.');
    });
}

// Add this to your window object to make it accessible globally
window.handleGumroadSuccess = handleGumroadSuccess;