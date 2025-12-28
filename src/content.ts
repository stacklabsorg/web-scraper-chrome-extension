if ((window as any).__SCRAPER_LOADED__) {
  console.log("Scraper already loaded");
} else {
  (window as any).__SCRAPER_LOADED__ = true;

  interface ScrapedItem {
    text: string;
    tag: string;
    url: string;
  }

  let isSelecting: boolean = false;
  let scrapedData: ScrapedItem[] = [];

  document.addEventListener("mouseover", (e: MouseEvent) => {
    if (!isSelecting) return;
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    el.style.outline = "2px solid red";
  });

  document.addEventListener("mouseout", (e: MouseEvent) => {
    if (!isSelecting) return;
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    el.style.outline = "";
  });

  document.addEventListener("click", (e: MouseEvent) => {
    if (!isSelecting) return;
    e.preventDefault();
    e.stopPropagation();

    const el = e.target;
    if (!(el instanceof HTMLElement)) return;

    const text = el.innerText?.trim();
    if (!text) return;

    scrapedData.push({
      text,
      tag: el.tagName,
      url: location.href
    });

    chrome.runtime.sendMessage({
      type: "DATA_UPDATED",
      payload: scrapedData
    });
  });

  chrome.runtime.onMessage.addListener((msg: { type: string }) => {
    if (msg.type === "START_SELECT") isSelecting = true;
    if (msg.type === "STOP_SELECT") isSelecting = false;
    if (msg.type === "CLEAR_DATA") scrapedData = [];
  });
}
