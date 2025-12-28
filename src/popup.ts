// interface ScrapedItem {
//   text: string;
// }

// const list = document.getElementById("list") as HTMLUListElement;

// const sendToTab = (type: string) => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tabId = tabs[0]?.id;
//     if (!tabId) return;

//     chrome.tabs.sendMessage(tabId, { type }, () => {
//       if (chrome.runtime.lastError) {
//         chrome.scripting.executeScript(
//           {
//             target: { tabId },
//             files: ["dist/content.js"]
//           },
//           () => {
//             chrome.tabs.sendMessage(tabId, { type });
//           }
//         );
//       }
//     });
//   });
// };




// (document.getElementById("start") as HTMLButtonElement).onclick = () =>
//   sendToTab("START_SELECT");

// (document.getElementById("stop") as HTMLButtonElement).onclick = () =>
//   sendToTab("STOP_SELECT");

// (document.getElementById("clear") as HTMLButtonElement).onclick = () => {
//   chrome.storage.local.set({ scraped: [] });
//   list.innerHTML = "";
//   sendToTab("CLEAR_DATA");
// };

// chrome.storage.local.get("scraped", (res: { scraped?: ScrapedItem[] }) => {
//   render(res.scraped || []);
// });

// chrome.storage.onChanged.addListener(
//   (changes: { [key: string]: chrome.storage.StorageChange }) => {
//     const newValue = changes.scraped?.newValue;

//     if (Array.isArray(newValue)) {
//       render(newValue as ScrapedItem[]);
//     } else {
//       render([]);
//     }
//   }
// );

// function render(data: ScrapedItem[]) {
//   list.innerHTML = "";
//   data.forEach((item) => {
//     const li = document.createElement("li");
//     li.innerText = item.text;
//     list.appendChild(li);
//   });
// }

const addField = () => {
  const fieldName = prompt("Enter field name (e.g., Title, Price, Image):");
  if (!fieldName) return;

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, { type: "START_SELECT", fieldName });
  });
};

const stopSelect = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, { type: "STOP_SELECT" });
  });
};

const scrapePage = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;
    chrome.tabs.sendMessage(tabId, { type: "SCRAPE_PAGE" });
  });
};

const downloadCSV = (data: any[]) => {
  if (!data.length) return;
  const csv = [
    Object.keys(data[0]).join(","),
    ...data.map(row => Object.values(row).map(v => `"${v}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scraped_data.csv";
  a.click();
};

// Listen for scraped data
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "SCRAPED_DATA") {
    downloadCSV(msg.payload);
  }
});

// Bind popup buttons
(document.getElementById("addField") as HTMLButtonElement).onclick = addField;
(document.getElementById("stop") as HTMLButtonElement).onclick = stopSelect;
(document.getElementById("scrape") as HTMLButtonElement).onclick = scrapePage;
