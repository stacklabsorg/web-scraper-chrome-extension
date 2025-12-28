// if ((window as any).__SCRAPER_LOADED__) {
//   console.log("Scraper already loaded");
// } else {
//   (window as any).__SCRAPER_LOADED__ = true;

//   interface ScrapedItem {
//     text: string;
//     tag: string;
//     url: string;
//   }

//   let isSelecting: boolean = false;
//   let scrapedData: ScrapedItem[] = [];

//   document.addEventListener("mouseover", (e: MouseEvent) => {
//     if (!isSelecting) return;
//     const el = e.target;
//     if (!(el instanceof HTMLElement)) return;
//     el.style.outline = "2px solid red";
//   });

//   document.addEventListener("mouseout", (e: MouseEvent) => {
//     if (!isSelecting) return;
//     const el = e.target;
//     if (!(el instanceof HTMLElement)) return;
//     el.style.outline = "";
//   });

//   document.addEventListener("click", (e: MouseEvent) => {
//     if (!isSelecting) return;
//     e.preventDefault();
//     e.stopPropagation();

//     const el = e.target;
//     if (!(el instanceof HTMLElement)) return;

//     const text = el.innerText?.trim();
//     if (!text) return;

//     scrapedData.push({
//       text,
//       tag: el.tagName,
//       url: location.href
//     });

//     chrome.runtime.sendMessage({
//       type: "DATA_UPDATED",
//       payload: scrapedData
//     });
//   });

//   chrome.runtime.onMessage.addListener((msg: { type: string }) => {
//     if (msg.type === "START_SELECT") isSelecting = true;
//     if (msg.type === "STOP_SELECT") isSelecting = false;
//     if (msg.type === "CLEAR_DATA") scrapedData = [];
//   });
// }

if (!(window as any).__SCRAPER_LOADED__) {
  (window as any).__SCRAPER_LOADED__ = true;

  let isSelecting = false;
  let currentFieldName: string | null = null;
  let selectedFields: Record<string, HTMLElement> = {};
  let products: Record<string, string>[] = [];

  // Highlight hover
  document.addEventListener("mouseover", (e) => {
    if (!isSelecting) return;
    const el = e.target as HTMLElement;
    el.style.outline = "2px solid red";
  });

  document.addEventListener("mouseout", (e) => {
    if (!isSelecting) return;
    const el = e.target as HTMLElement;
    el.style.outline = "";
  });

  // Click to select element
  document.addEventListener("click", (e) => {
    if (!isSelecting || !currentFieldName) return;
    e.preventDefault();
    e.stopPropagation();

    const el = e.target as HTMLElement;
    selectedFields[currentFieldName] = el;
    el.style.outline = "2px solid green";

    chrome.runtime.sendMessage({
      type: "FIELD_SELECTED",
      fieldName: currentFieldName,
      tagName: el.tagName,
    });
  });

  // Listen to popup commands
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "START_SELECT") {
      currentFieldName = msg.fieldName;
      isSelecting = true;
    }
    if (msg.type === "STOP_SELECT") {
      currentFieldName = null;
      isSelecting = false;
    }
    if (msg.type === "SCRAPE_PAGE") {
      if (!Object.keys(selectedFields).length) return;

      // Find common parent container
      const parents = Object.values(selectedFields).map((el) =>
        el.closest("*")
      );
      const commonParent = parents[0]?.parentElement;
      if (!commonParent) return;

      const allCards = Array.from(commonParent.children);

      products = allCards.map((card) => {
        const item: Record<string, string> = {};
        for (let fieldName in selectedFields) {
          const sel = selectedFields[fieldName];
          const el = card.querySelector(sel.tagName);
          item[fieldName] =
            el?.textContent?.trim() || (el as HTMLImageElement)?.src || "";
        }
        return item;
      });

      chrome.runtime.sendMessage({ type: "SCRAPED_DATA", payload: products });
    }
  });
}
