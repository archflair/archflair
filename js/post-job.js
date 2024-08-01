// Ensure this matches the URL in your main script.js file
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyUlKaWPfXi7lRBmQx8EYjkETc9JBtVA-zt5wbiuIrD9S5pmn3mmNhjyOSTEL-PbKtBQ/exec';

// Gumroad product link
const GUMROAD_LINK = 'https://archflair.gumroad.com/l/henql';

let currentJobId = null;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('jobPostForm');
    const previewBtn = document.getElementById('previewJobBtn');
    const submitBtn = document.getElementById('submitJobBtn');

    previewBtn.addEventListener('click', previewJob);
    form.addEventListener('submit', handleJobSubmission);

    // Set up Gumroad overlay callback
    if (window.GumroadOverlay) {
        window.GumroadOverlay.setCallback(handleGumroadSuccess);
    }

    // Setup close button for job preview popup
    const closePreviewBtn = document.querySelector('#jobPreviewPopup .close');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closeJobPreview);
    }
});

function previewJob(event) {
    event.preventDefault();
    const jobData = getJobDataFromForm();
    showJobPreview(jobData);
}

function handleJobSubmission(event) {
    event.preventDefault();
    const jobData = getJobDataFromForm();
    
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

function showConfirmationPopup(jobId) {
    const confirmationPopup = document.getElementById('confirmationPopup');
    confirmationPopup.style.display = 'flex';

    const proceedToPaymentBtn = document.getElementById('proceedToPaymentBtn');
    proceedToPaymentBtn.href = `${GUMROAD_LINK}?wanted=true&jobId=${jobId}`;
    
    proceedToPaymentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmationPopup.style.display = 'none';
        // Trigger Gumroad overlay
        Gumroad.createOverlay(proceedToPaymentBtn.href, {
            success_callback: handleGumroadSuccess
        });
    });
}

function closeJobPreview() {
    const jobPreviewPopup = document.getElementById('jobPreviewPopup');
    if (jobPreviewPopup) {
        jobPreviewPopup.style.display = 'none';
    }
}

function handleGumroadSuccess(data) {
    console.log('Gumroad payment successful:', data);
    
    // Update payment status in the backend
    const params = new URLSearchParams();
    params.append('action', 'updatePaymentStatus');
    params.append('jobId', currentJobId);
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