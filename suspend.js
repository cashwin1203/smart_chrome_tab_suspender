// Get tabId from URL
const params = new URLSearchParams(window.location.search);
const tabId = params.get("tabId");

if (tabId) {
  chrome.storage.local.get(`tab_${tabId}`, data => {
    const state = data[`tab_${tabId}`];
    if (!state) return;

    // Restore title
    document.title = state.title || "Suspended Tab";

    // Restore favicon
    const favicon = document.getElementById("favicon");
    if (state.favIconUrl) {
      favicon.href = state.favIconUrl;
    }
  });
}
