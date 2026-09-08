// Blank Notes - A private, minimalist notes app
// All data stored locally. No tracking, no analytics, no backend.

const STORAGE_KEY = 'blank-notes-content';
const VISIBILITY_KEY = 'blank-notes-visible';

// DOM elements
const editor = document.getElementById('editor');
const toggleBtn = document.getElementById('toggleBtn');
const newBtn = document.getElementById('newBtn');
const deleteBtn = document.getElementById('deleteBtn');

// State
let isVisible = false;

/**
 * Initialize the application
 */
function init() {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(err => {
            // Service worker registration failed; app still works locally
            console.log('Service worker registration failed:', err);
        });
    }

    // Load persisted note content
    loadNote();

    // Load persisted visibility state
    loadVisibilityState();

    // Set up event listeners
    editor.addEventListener('input', saveNote);
    editor.addEventListener('change', saveNote);

    toggleBtn.addEventListener('click', toggleVisibility);
    newBtn.addEventListener('click', createNewNote);
    deleteBtn.addEventListener('click', deleteNote);

    // Focus editor on load
    editor.focus();

    // Handle beforeunload to ensure data is saved
    window.addEventListener('beforeunload', saveNote);
}

/**
 * Load note content from local storage
 */
function loadNote() {
    const content = localStorage.getItem(STORAGE_KEY);
    if (content !== null) {
        editor.value = content;
    }
}

/**
 * Save note content to local storage (debounced by input event frequency)
 */
function saveNote() {
    localStorage.setItem(STORAGE_KEY, editor.value);
}

/**
 * Load visibility state from local storage
 */
function loadVisibilityState() {
    const saved = localStorage.getItem(VISIBILITY_KEY);
    // Default to hidden (false)
    isVisible = saved === 'true' ? true : false;
    updateVisibilityUI();
}

/**
 * Save visibility state to local storage
 */
function saveVisibilityState() {
    localStorage.setItem(VISIBILITY_KEY, isVisible.toString());
}

/**
 * Toggle between hidden and visible modes
 */
function toggleVisibility() {
    isVisible = !isVisible;
    saveVisibilityState();
    updateVisibilityUI();
}

/**
 * Update UI to reflect current visibility state
 */
function updateVisibilityUI() {
    if (isVisible) {
        editor.classList.remove('hidden-mode');
        editor.classList.add('visible-mode');
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.setAttribute('title', 'Visible');
    } else {
        editor.classList.remove('visible-mode');
        editor.classList.add('hidden-mode');
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.setAttribute('title', 'Hidden');
    }
}

/**
 * Create a new note
 */
function createNewNote() {
    const currentContent = editor.value.trim();

    if (currentContent.length === 0) {
        // Already empty, just reset
        editor.value = '';
        editor.focus();
        saveNote();
        return;
    }

    // Ask for confirmation
    if (confirm('Delete current note? This cannot be undone.')) {
        editor.value = '';
        isVisible = false;
        saveNote();
        saveVisibilityState();
        updateVisibilityUI();
        editor.focus();
    }
}

/**
 * Delete the current note
 */
function deleteNote() {
    const currentContent = editor.value.trim();

    if (currentContent.length === 0) {
        // Nothing to delete
        return;
    }

    // Ask for confirmation
    if (confirm('Delete this note permanently? This cannot be undone.')) {
        editor.value = '';
        isVisible = false;
        saveNote();
        saveVisibilityState();
        updateVisibilityUI();
        editor.focus();
    }
}

/**
 * Restore service worker after updates (optional enhancement)
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        // New service worker has taken control; note data persists
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
