chrome.runtime.onMessage.addListener(
  (msg: { type: string; payload?: any }) => {
    if (msg.type === "DATA_UPDATED") {
      chrome.storage.local.set({ scraped: msg.payload });
    }
  }
);
