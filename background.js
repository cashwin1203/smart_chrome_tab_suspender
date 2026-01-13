const SUSPEND_AFTER_MINUTES = 2; 

// Store last active time
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.storage.local.set({ lastActive: Date.now() });
});

// Check tabs every 30 seconds
setInterval(() => {
  chrome.tabs.query({}, tabs => {
    const now = Date.now();

    tabs.forEach(tab => {
      if (
        !tab.active &&
        !tab.pinned &&
        tab.url &&
        !tab.url.startsWith("chrome://") &&
        !tab.url.includes("suspended.html")
      ) {
        chrome.storage.local.get("lastActive", data => {
          const lastActive = data.lastActive || now;
          const inactiveTime = now - lastActive;

          if (inactiveTime > SUSPEND_AFTER_MINUTES * 60 * 1000) {
            suspendTab(tab);
          }
        });
      }
    });
  });
}, 30000);

// Suspend logic
function suspendTab(tab) {
  const tabState = {
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl
  };

  chrome.storage.local.set({ [`tab_${tab.id}`]: tabState }, () => {
    chrome.tabs.update(tab.id, {
      url: chrome.runtime.getURL("suspended.html") + `?tabId=${tab.id}`
    });
  });
}

// Restore when tab is activated
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.storage.local.get(`tab_${tabId}`, data => {
    const state = data[`tab_${tabId}`];
    if (!state) return;

    chrome.tabs.update(tabId, { url: state.url });
    chrome.storage.local.remove(`tab_${tabId}`);
  });
});
