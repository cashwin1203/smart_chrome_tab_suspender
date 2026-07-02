// Get tabId from URL
const params = new URLSearchParams(window.location.search);
const tabId = params.get("tabId");

if (tabId) {
  chrome.storage.local.get(`tab_${tabId}`, (data) => {
    const state = data[`tab_${tabId}`];
    if (!state) return;

    // Restore title in browser tab header
    const cleanTitle = state.title || "Suspended Tab";
    document.title = "💤 " + cleanTitle;

    // Restore favicon in browser tab header
    const favicon = document.getElementById("favicon");
    if (state.favIconUrl) {
      favicon.href = state.favIconUrl;
    }

    // Update page elements with original tab metadata
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) {
      pageTitle.textContent = cleanTitle;
    }

    const pageFavicon = document.getElementById("page-favicon");
    const fallbackFavicon = document.getElementById("favicon-fallback");
    if (pageFavicon && state.favIconUrl) {
      pageFavicon.src = state.favIconUrl;
      pageFavicon.style.display = "block";
      if (fallbackFavicon) {
        fallbackFavicon.style.display = "none";
      }
    }

    // Restoration handler
    let isRestoring = false;
    const restoreTab = () => {
      if (isRestoring) return;
      isRestoring = true;
      
      chrome.storage.local.remove(`tab_${tabId}`, () => {
        window.location.replace(state.url);
      });
    };

    // Click handler for the action button
    const restoreBtn = document.getElementById("restore-btn");
    if (restoreBtn) {
      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        restoreTab();
      });
    }

    // Click handler for clicking anywhere else on the document
    document.addEventListener("click", () => {
      restoreTab();
    });
  });
}
