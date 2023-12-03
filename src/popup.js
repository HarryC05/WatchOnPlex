import './popup.css';

// store the options in chrome.storage
function save_options() {
  const plexURL = document.getElementById('plexURL').value;
  const plexToken = document.getElementById('plexToken').value;

  chrome.storage.sync.set({
    plexURL,
    plexToken,
  }, function() {
    // Update status to let user know options were saved.
    const statusEl = document.getElementsByClassName('WatchOnPlex--status-indicator')[0];
    const statusTextEl = statusEl.getElementsByClassName('WatchOnPlex--status-indicator--text')[0];
    statusEl.classList.add('WatchOnPlex--status-indicator--success');
    statusTextEl.textContent = 'Options saved.';
    setTimeout(function() {
      statusEl.classList.remove('WatchOnPlex--status-indicator--success');
      statusTextEl.textContent = '';
    }, 1500);
  });
}

// restore the options from chrome.storage
function restore_options() {
  chrome.storage.sync.get({
    plexURL: '',
    plexToken: '',
  }, function(items) {
    document.getElementById('plexURL').value = items.plexURL;
    document.getElementById('plexToken').value = items.plexToken;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);