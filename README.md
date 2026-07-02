# Smart Chrome Tab Suspender

A lightweight, modern Manifest V3 Chrome Extension that automatically suspends inactive tabs to reclaim system memory and keep your computer running smoothly.

---

## Features

- **Auto-Suspension**: Automatically suspends tabs that have been inactive for a set duration (default: 2 minutes) to free up RAM.
- **Per-Tab Active Tracking**: Intelligently tracks last-active times individually per tab and across multiple windows so your currently active tabs are never suspended.
- **Storage Leak Prevention**: Instantly cleans up internal metadata when tabs are closed.
- **Premium Aesthetic UI**: Suspended tabs display a beautiful dark-mode glassmorphic interface showing the tab's original favicon and page title.
- **Double-Safe Restoration**: Instantly reload/restore the tab by either clicking the **Restore Tab** button, clicking anywhere on the page, or simply returning to the tab.
- **Clean History**: Uses history-safe redirection to prevent cluttering your browser's back/forward history.

---

## File Structure

- [manifest.json](manifest.json): Extension configuration and API permissions (Manifest V3 compliant).
- [background.js](background.js): Ephemeral Service Worker running alarms and managing idle tracking.
- [suspended.html](suspended.html): Glassmorphic UI shown on suspended tabs.
- [suspend.js](suspend.js): Handles restoration actions and updates title/favicon.

---

## How to Install Locally

1. Clone or download this repository to your computer.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. Select the `smart_chrome_tab_suspender` folder containing the extension files.
