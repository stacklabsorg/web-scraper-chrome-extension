// chrome.runtime.onMessage.addListener(
//   (msg: { type: string; payload?: any }) => {
//     if (msg.type === "DATA_UPDATED") {
//       chrome.storage.local.set({ scraped: msg.payload });
//     }
//   }
// );
chrome.runtime.onMessage.addListener((msg, sender) => {
  // You can log or debug messages here
  console.log("Background received:", msg);
});
