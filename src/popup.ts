interface ScrapedItem {
  text: string;
}

const list = document.getElementById("list") as HTMLUListElement;

const sendToTab = (type: string) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    // 1️⃣ Try sending message
    chrome.tabs.sendMessage(tabId, { type }, () => {
      if (chrome.runtime.lastError) {
        // 2️⃣ If no receiver → inject content script
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["dist/content.js"]
          },
          () => {
            // 3️⃣ Retry message after inject
            chrome.tabs.sendMessage(tabId, { type });
          }
        );
      }
    });
  });
};




(document.getElementById("start") as HTMLButtonElement).onclick = () =>
  sendToTab("START_SELECT");

(document.getElementById("stop") as HTMLButtonElement).onclick = () =>
  sendToTab("STOP_SELECT");

(document.getElementById("clear") as HTMLButtonElement).onclick = () => {
  chrome.storage.local.set({ scraped: [] });
  list.innerHTML = "";
  sendToTab("CLEAR_DATA");
};

chrome.storage.local.get("scraped", (res: { scraped?: ScrapedItem[] }) => {
  render(res.scraped || []);
});

chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }) => {
    const newValue = changes.scraped?.newValue;

    if (Array.isArray(newValue)) {
      render(newValue as ScrapedItem[]);
    } else {
      render([]);
    }
  }
);

function render(data: ScrapedItem[]) {
  list.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    li.innerText = item.text;
    list.appendChild(li);
  });
}
