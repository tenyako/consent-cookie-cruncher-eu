
// Background script for the cookie banner extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Cookie Banner Handler extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    delay: 1000,
    stats: {
      bannersHandled: 0,
      sitesVisited: []
    }
  });

  // Create context menu with error handling
  try {
    chrome.contextMenus.create({
      id: 'toggleCookieHandler',
      title: 'Toggle Cookie Banner Handler',
      contexts: ['page']
    });
  } catch (error) {
    console.log('Context menu creation failed:', error);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'bannerHandled') {
    // Update statistics
    chrome.storage.sync.get(['stats'], (result) => {
      const stats = result.stats || { bannersHandled: 0, sitesVisited: [] };
      stats.bannersHandled++;
      
      const domain = new URL(message.url).hostname;
      if (!stats.sitesVisited.includes(domain)) {
        stats.sitesVisited.push(domain);
      }
      
      chrome.storage.sync.set({ stats });
      
      console.log(`Cookie banner handled on ${domain}`);
    });
  }
});

// Handle context menu clicks with error handling
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggleCookieHandler') {
    chrome.storage.sync.get(['enabled'], (result) => {
      const newState = !result.enabled;
      chrome.storage.sync.set({ enabled: newState });
      
      // Reload the current tab to apply changes
      if (tab && tab.id) {
        chrome.tabs.reload(tab.id);
      }
    });
  }
});
