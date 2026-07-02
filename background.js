const SUSPEND_AFTER_MINUTES = 2;

// Alarm listener for checking tab suspension
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkSuspension") {
    checkTabsForSuspension();
  }
});

// Setup alarm and initial state on installation or startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkSuspension", { periodInMinutes: 0.5 });
  initializeActiveTabs();
});

chrome.runtime.onStartup.addListener(() => {
  initializeActiveTabs();
});

// Keep track of active tabs in each window
function initializeActiveTabs() {
  chrome.tabs.query({ active: true }, (tabs) => {
    const updates = {};
    const now = Date.now();
    tabs.forEach((tab) => {
      updates[`activeTab_${tab.windowId}`] = tab.id;
      updates[`lastActive_${tab.id}`] = now;
    });
    chrome.storage.local.set(updates);
  });
}

// Track active status changes to set idle time for deactivated tabs
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  const now = Date.now();

  chrome.storage.local.get([`tab_${tabId}`, `activeTab_${windowId}`], (data) => {
    const suspendedState = data[`tab_${tabId}`];
    const prevActiveTabId = data[`activeTab_${windowId}`];
    const updates = {};

    // Update active tab for this window
    updates[`activeTab_${windowId}`] = tabId;

    // Record when the previous active tab became inactive
    if (prevActiveTabId && prevActiveTabId !== tabId) {
      updates[`lastActive_${prevActiveTabId}`] = now;
    }

    // Keep the newly active tab's timestamp updated
    updates[`lastActive_${tabId}`] = now;

    // Restore URL if the tab was suspended
    if (suspendedState) {
      chrome.tabs.update(tabId, { url: suspendedState.url });
      chrome.storage.local.remove(`tab_${tabId}`);
    }

    chrome.storage.local.set(updates);
  });
});

// Record last active time when a tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.active) {
    chrome.storage.local.set({ [`lastActive_${tab.id}`]: Date.now() });
  }
});

// Clean up stored state when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove([
    `tab_${tabId}`,
    `lastActive_${tabId}`
  ]);
});

// Check all tabs and suspend those that have been inactive longer than SUSPEND_AFTER_MINUTES
function checkTabsForSuspension() {
  chrome.tabs.query({}, (tabs) => {
    const now = Date.now();

    tabs.forEach((tab) => {
      // Suspend if tab is not active, not pinned, is a web page, and is not already suspended
      if (
        !tab.active &&
        !tab.pinned &&
        tab.url &&
        (tab.url.startsWith("http://") || tab.url.startsWith("https://")) &&
        !tab.url.includes("suspended.html")
      ) {
        const lastActiveKey = `lastActive_${tab.id}`;
        chrome.storage.local.get(lastActiveKey, (data) => {
          const lastActive = data[lastActiveKey];

          // If no timestamp exists, initialize it to current time
          if (lastActive === undefined) {
            chrome.storage.local.set({ [lastActiveKey]: now });
            return;
          }

          const inactiveTime = now - lastActive;
          if (inactiveTime > SUSPEND_AFTER_MINUTES * 60 * 1000) {
            suspendTab(tab);
          }
        });
      }
    });
  });
}

// Suspend a specific tab and save its state
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
