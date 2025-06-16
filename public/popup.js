
// Popup script for managing extension settings
document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const delayInput = document.getElementById('delayInput');
  const bannersCount = document.getElementById('bannersCount');
  const sitesCount = document.getElementById('sitesCount');
  const resetStatsBtn = document.getElementById('resetStats');
  const testModeBtn = document.getElementById('testMode');
  const resetAttemptsBtn = document.getElementById('resetAttempts');

  // Load current settings
  const result = await chrome.storage.sync.get(['enabled', 'delay', 'stats', 'domainAttempts']);
  
  enableToggle.checked = result.enabled !== false; // Default to true
  delayInput.value = result.delay || 1000;
  
  const stats = result.stats || { bannersHandled: 0, sitesVisited: [] };
  bannersCount.textContent = stats.bannersHandled;
  sitesCount.textContent = stats.sitesVisited.length;

  // Show current domain attempt count
  const domainAttempts = result.domainAttempts || {};
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const domain = new URL(tabs[0].url).hostname;
      const attempts = domainAttempts[domain] || 0;
      const currentDomainSpan = document.getElementById('currentDomainAttempts');
      if (currentDomainSpan) {
        currentDomainSpan.textContent = `${domain}: ${attempts}/2 attempts`;
      }
    }
  });

  // Save settings when changed
  enableToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enableToggle.checked });
    
    // Reload current tab to apply changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });

  delayInput.addEventListener('change', () => {
    const delay = parseInt(delayInput.value) || 1000;
    chrome.storage.sync.set({ delay: delay });
  });

  // Reset statistics
  resetStatsBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ 
      stats: { bannersHandled: 0, sitesVisited: [] } 
    });
    
    bannersCount.textContent = '0';
    sitesCount.textContent = '0';
  });

  // Reset domain attempts
  resetAttemptsBtn.addEventListener('click', () => {
    chrome.storage.sync.set({ domainAttempts: {} });
    
    // Update current domain display
    const currentDomainSpan = document.getElementById('currentDomainAttempts');
    if (currentDomainSpan) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const domain = new URL(tabs[0].url).hostname;
          currentDomainSpan.textContent = `${domain}: 0/2 attempts`;
        }
      });
    }
  });

  // Test mode - manually trigger banner detection on current page
  testModeBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            // Trigger banner detection immediately
            const event = new CustomEvent('forceCookieCheck');
            document.dispatchEvent(event);
          }
        });
      }
    });
    
    window.close();
  });
});
