
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

// Optional: Add context menu item
chrome.contextMenus.create({
  id: 'toggleCookieHandler',
  title: 'Toggle Cookie Banner Handler',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggleCookieHandler') {
    chrome.storage.sync.get(['enabled'], (result) => {
      const newState = !result.enabled;
      chrome.storage.sync.set({ enabled: newState });
      
      // Reload the current tab to apply changes
      chrome.tabs.reload(tab.id);
    });
  }
});
