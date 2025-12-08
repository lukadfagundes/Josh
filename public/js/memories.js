// API endpoint
const API_URL = '/api/memories';

// DOM elements
const form = document.getElementById('memoryForm');
const fromInput = document.getElementById('from');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const formMessage = document.getElementById('formMessage');
const memoriesList = document.getElementById('memoriesList');
const submitBtn = document.getElementById('submitBtn');

// Character counter
messageInput.addEventListener('input', () => {
  const count = messageInput.value.length;
  charCount.textContent = count;

  charCount.classList.remove('warning', 'error');
  if (count > 9000) {
    charCount.classList.add('error');
  } else if (count > 7500) {
    charCount.classList.add('warning');
  }
});

/**
 * Displays a message to the user
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showMessage(message, type) {
  formMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
  setTimeout(() => {
    formMessage.innerHTML = '';
  }, 5000);
}

/**
 * Submits a memory message to the backend
 * @param {Object} formData - { from: string, message: string }
 * @returns {Promise<Response>}
 * @throws {ValidationError} If character limit exceeded or fields empty
 */
async function submitMemory(formData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Submission failed');
    }

    return data;
  } catch (error) {
    console.error('Error submitting memory:', error);
    throw error;
  }
}

/**
 * Loads and displays all memories
 * @param {HTMLElement} container - DOM element to render memories
 * @returns {Promise<void>}
 * @throws {NetworkError} If fetch fails
 */
async function loadMemories(container) {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to load memories');
    }

    displayMemories(data.memories, container);
  } catch (error) {
    console.error('Error loading memories:', error);
    container.innerHTML = '<div class="message error">Failed to load memories. Please refresh the page.</div>';
  }
}

/**
 * Displays memories in the DOM
 * @param {Array} memories - Array of memory objects
 * @param {HTMLElement} container - Container element
 */
function displayMemories(memories, container) {
  if (!memories || memories.length === 0) {
    container.innerHTML = '<p class="text-center">No memories shared yet. Be the first to share a memory.</p>';
    return;
  }

  const html = memories.map(memory => {
    const date = new Date(memory.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="memory-card">
        <div class="memory-from">${escapeHtml(memory.from)}</div>
        <div class="memory-message">${escapeHtml(memory.message)}</div>
        <div class="memory-date">${date}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Escapes HTML to prevent XSS (double protection)
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    from: fromInput.value.trim(),
    message: messageInput.value.trim()
  };

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    await submitMemory(formData);

    showMessage('Thank you for sharing your memory.', 'success');

    // Reset form
    form.reset();
    charCount.textContent = '0';
    charCount.classList.remove('warning', 'error');

    // Reload memories
    await loadMemories(memoriesList);
  } catch (error) {
    showMessage(error.message || 'Failed to submit. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Share Memory';
  }
});

// Load memories on page load
document.addEventListener('DOMContentLoaded', () => {
  loadMemories(memoriesList);
});
