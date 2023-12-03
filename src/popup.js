import './popup.css';

// store the options in chrome.storage
async function save_options() {
  const statusEl = document.getElementsByClassName('WatchOnPlex--status-indicator')[0];
  const statusTextEl = statusEl.getElementsByClassName('WatchOnPlex--status-indicator--text')[0];
  
  const plexURL = document.getElementById('plexURL').value;
  const plexToken = document.getElementById('plexToken').value;

  if (!plexURL || !plexToken) {
    statusEl.classList.add('WatchOnPlex--status-indicator--error');
    statusTextEl.textContent = 'Please enter your Plex URL and Plex Token.';
    return;
  }

  statusEl.classList.remove('WatchOnPlex--status-indicator--error');
  statusEl.classList.add('WatchOnPlex--status-indicator--loading');
  statusTextEl.textContent = 'Saving...';

  let machineIdentifier = '';

  const serverUrl = `https://${plexURL}/servers?X-Plex-Token=${plexToken}`;

  const response = await fetch(serverUrl);

  const xml = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  machineIdentifier = xmlDoc.getElementsByTagName('Server')[0].getAttribute('machineIdentifier');

  chrome.storage.sync.set({
    plexURL,
    plexToken,
    machineIdentifier,
  }, function() {
    // Update status to let user know options were saved.
    statusEl.classList.remove('WatchOnPlex--status-indicator--loading');
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