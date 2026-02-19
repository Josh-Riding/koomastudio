// Background service worker — handles API calls on behalf of content script

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SAVE_POST") {
    handleSavePost(message.payload)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async response
  }
});

async function handleSavePost(payload) {
  const { token, postData } = payload;

  const { DEV_BASE_URL } = await chrome.storage.local.get("DEV_BASE_URL");
  const baseUrl = DEV_BASE_URL || "https://koomastudio.com";

  const url = `${baseUrl.replace(/\/$/, "")}/api/extension/save`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}
