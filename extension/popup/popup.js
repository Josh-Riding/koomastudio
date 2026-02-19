const tokenInput = document.getElementById("token");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");
const settingsLink = document.getElementById("settingsLink");
const connBadge = document.getElementById("connBadge");
const connLabel = document.getElementById("connLabel");
const fieldToken = document.getElementById("fieldToken");

settingsLink.href = "https://koomastudio.com/settings";

// Load saved values and reflect connected state
chrome.storage.local.get("token", (result) => {
  if (result.token) tokenInput.value = result.token;
  setConnectedState(!!result.token);
});

function setConnectedState(connected) {
  if (connected) {
    connBadge.className = "badge connected";
    connLabel.textContent = "Connected";
    fieldToken.classList.add("is-saved");
    tokenInput.classList.add("is-saved");
  } else {
    connBadge.className = "badge disconnected";
    connLabel.textContent = "Not set";
    fieldToken.classList.remove("is-saved");
    tokenInput.classList.remove("is-saved");
  }
}

// Clear saved state when user edits
tokenInput.addEventListener("input", () => {
  setConnectedState(false);
  statusEl.className = "status";
});

saveBtn.addEventListener("click", () => {
  const token = tokenInput.value.trim();

  if (!token) {
    showError("Please enter your extension token.");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  chrome.storage.local.set({ token }, () => {
    setConnectedState(true);

    saveBtn.classList.add("success");
    saveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved`;

    setTimeout(() => {
      saveBtn.classList.remove("success");
      saveBtn.textContent = "Save Settings";
      saveBtn.disabled = false;
    }, 2000);
  });
});

function showError(msg) {
  statusEl.textContent = msg;
  statusEl.className = "status error";
  setTimeout(() => { statusEl.className = "status"; }, 3000);
}
