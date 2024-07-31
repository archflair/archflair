const SCRIPT_URL = 'https://script.google.com/macros/s/your-script-id/exec';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId');
  if (jobId) {
    updatePaymentStatus(jobId);
  } else {
    showError('No job ID found in the URL.');
  }
});

async function updatePaymentStatus(jobId) {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=updatePaymentStatus`, {
      method: 'POST',
      body: new URLSearchParams({jobId: jobId}),
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      showSuccess('Payment confirmed. Your job posting will be reviewed by our admin team.');
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
}

function showSuccess(message) {
  const statusElement = document.getElementById('paymentStatus');
  statusElement.textContent = message;
  statusElement.className = 'success';
}

function showError(message) {
  const statusElement = document.getElementById('paymentStatus');
  statusElement.textContent = message;
  statusElement.className = 'error';
}