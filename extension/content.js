// Content script — injects "Save to koomastudio" buttons into LinkedIn feed

const BUTTON_ATTR = "data-koomastu-injected";
const SAVE_BTN_CLASS = "koomastu-save-btn";

const ICON_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>`;
const KS_LABEL = `<span class="koomastu-ks">ks</span>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_SPIN = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="koomastu-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

// Inject CSS once
if (!document.getElementById("koomastu-styles")) {
  const style = document.createElement("style");
  style.id = "koomastu-styles";
  style.textContent = `
    @keyframes koomastu-spin { to { transform: rotate(360deg); } }
    .koomastu-spin { animation: koomastu-spin 0.8s linear infinite; }

    .${SAVE_BTN_CLASS} {
      display: inline-flex;
      align-items: center;
      align-self: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(139,92,246,0.3);
      background: rgba(124,58,237,0.2);
      color: #a78bfa;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      margin-left: 2px;
      flex-shrink: 0;
      width: fit-content;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .${SAVE_BTN_CLASS}:hover { background: #7c3aed; border-color: #7c3aed; color: #ffffff; }
    .${SAVE_BTN_CLASS}:disabled { opacity: 0.5; cursor: not-allowed; }
    .${SAVE_BTN_CLASS}.saving { color: #a78bfa; }
    .${SAVE_BTN_CLASS}.saved { color: #16a34a; }
    .${SAVE_BTN_CLASS}.error { color: #dc2626; }
    .koomastu-ks {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    #koomastu-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
    }
    #koomastu-dialog {
      background: #18181b; color: #fafafa;
      border: 1px solid #3f3f46; border-radius: 12px;
      padding: 20px; width: 340px; max-width: 90vw;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    #koomastu-dialog-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; font-weight: 700; font-size: 14px;
    }
    #koomastu-close {
      background: none; border: none; color: #71717a;
      cursor: pointer; font-size: 16px; padding: 0; line-height: 1;
    }
    #koomastu-close:hover { color: #fafafa; }
    #koomastu-author { color: #a1a1aa; font-size: 12px; margin-bottom: 10px; }
    .koomastu-tag {
      background: #7c3aed22; color: #a78bfa;
      border-radius: 4px; padding: 1px 6px; font-size: 11px;
    }
    #koomastu-notes, #koomastu-tag-input {
      width: 100%; background: #09090b; border: 1px solid #3f3f46;
      border-radius: 8px; color: #fafafa; padding: 8px 10px;
      font-size: 13px; outline: none;
      font-family: inherit; box-sizing: border-box;
    }
    #koomastu-notes { resize: vertical; }
    #koomastu-notes:focus, #koomastu-tag-input:focus { border-color: #7c3aed; }
    #koomastu-notes::placeholder, #koomastu-tag-input::placeholder { color: #71717a !important; opacity: 1 !important; }
    #koomastu-tag-row { display: flex; gap: 6px; margin-bottom: 10px; }
    #koomastu-tag-input { flex: 1; }
    #koomastu-tag-add {
      padding: 7px 12px; background: transparent; border: 1px solid #3f3f46;
      border-radius: 8px; color: #a1a1aa; cursor: pointer; font-size: 12px;
      white-space: nowrap;
    }
    #koomastu-tag-add:hover { border-color: #7c3aed; color: #a78bfa; }
    #koomastu-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
    .koomastu-tag-chip {
      display: inline-flex; align-items: center; gap: 4px;
      background: #7c3aed22; color: #a78bfa; border: 1px solid #7c3aed44;
      border-radius: 4px; padding: 2px 8px; font-size: 11px;
    }
    .koomastu-tag-chip button {
      background: none; border: none; color: #a78bfa; cursor: pointer;
      padding: 0; font-size: 12px; line-height: 1;
    }
    .koomastu-tag-chip button:hover { color: #fafafa; }
    #koomastu-dialog-footer {
      display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;
    }
    #koomastu-cancel {
      padding: 7px 14px; background: transparent; border: 1px solid #3f3f46;
      border-radius: 6px; color: #a1a1aa; cursor: pointer; font-size: 13px;
    }
    #koomastu-cancel:hover { border-color: #71717a; color: #fafafa; }
    #koomastu-confirm {
      padding: 7px 16px; background: #7c3aed; border: none;
      border-radius: 6px; color: #fff; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    #koomastu-confirm:hover { background: #6d28d9; }
    #koomastu-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

    #koomastu-toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      display: flex; align-items: center; gap: 10px;
      background: #ffffff; color: #7c3aed;
      border: 1px solid #ede9fe; border-radius: 10px;
      padding: 12px 16px; font-size: 13px; font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      opacity: 0; transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }
    #koomastu-toast.show { opacity: 1; transform: translateY(0); }
    #koomastu-toast-icon { color: #7c3aed; flex-shrink: 0; }
    #koomastu-toast-sub { font-size: 11px; color: #a78bfa; font-weight: 400; margin-top: 1px; }
  `;
  document.head.appendChild(style);
}

function extractPostData(postEl) {
  // Content — try attributed text first, then fallback to span text
  let content = "";
  const attrSegments = postEl.querySelectorAll(
    ".attributed-text-segment-list__content",
  );
  if (attrSegments.length > 0) {
    content = Array.from(attrSegments)
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  } else {
    const spans = postEl.querySelectorAll(
      ".feed-shared-update-v2__description span[dir]",
    );
    content = Array.from(spans)
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  // Actor link — used for both name and URL
  const actorLink =
    postEl.querySelector("a.update-components-actor__meta-link") ??
    postEl.querySelector(".feed-shared-actor__container-link") ??
    postEl.querySelector("a[href*='/in/']");

  // Author URL
  let authorUrl = "";
  if (actorLink) {
    const href = actorLink.getAttribute("href") ?? "";
    authorUrl = href.startsWith("http")
      ? href
      : `https://www.linkedin.com${href}`;
    // Strip tracking query params, keep just the profile path
    try {
      const u = new URL(authorUrl);
      authorUrl = u.origin + u.pathname;
    } catch {
      // keep as-is
    }
  }

  // Author name — try dedicated elements first, then fall back to text inside actor link
  let authorName = "";
  const nameEl =
    postEl.querySelector(".public_post_embed_feed-actor-name") ??
    postEl.querySelector(".update-components-actor__name span[aria-hidden='true']") ??
    postEl.querySelector(".update-components-actor__name") ??
    postEl.querySelector(".feed-shared-actor__name");
  if (nameEl) {
    authorName = nameEl.textContent?.trim() ?? "";
  } else if (actorLink) {
    // Grab the first non-empty text node inside the link
    const linkText = actorLink.querySelector("span[aria-hidden='true']");
    authorName = linkText?.textContent?.trim() ?? actorLink.textContent?.trim() ?? "";
  }

  // Post URL + embed URL
  // Strategy 1: data-urn on the post container or a parent
  let postUrl = "";
  let embedUrl = "";

  function extractFromUrn(urn) {
    if (!urn) return;
    const match = urn.match(/urn:li:activity:(\d+)/);
    if (match) {
      postUrl = `https://www.linkedin.com/feed/update/urn:li:activity:${match[1]}`;
      embedUrl = `https://www.linkedin.com/embed/feed/update/urn:li:activity:${match[1]}`;
    }
  }

  // Check the post element and its parents for data-urn
  let el = postEl;
  for (let i = 0; i < 4 && el; i++) {
    const urn = el.getAttribute("data-urn") ?? el.getAttribute("data-id");
    if (urn?.includes("activity")) { extractFromUrn(urn); break; }
    el = el.parentElement;
  }

  // Strategy 2: find any link containing the activity URN
  if (!postUrl) {
    const allLinks = postEl.querySelectorAll("a[href*='activity']");
    for (const link of allLinks) {
      const href = link.getAttribute("href") ?? "";
      extractFromUrn(href);
      if (postUrl) break;
    }
  }

  // Strategy 3: timestamp/ago link (usually links to the post)
  if (!postUrl) {
    const timeLink =
      postEl.querySelector("a[href*='/feed/update/']") ??
      postEl.querySelector("a.app-aware-link[href*='/posts/']") ??
      postEl.querySelector("time")?.closest("a");
    if (timeLink) {
      const href = timeLink.getAttribute("href") ?? "";
      const full = href.startsWith("http") ? href : `https://www.linkedin.com${href}`;
      try {
        const u = new URL(full);
        postUrl = u.origin + u.pathname;
      } catch { postUrl = full; }
      extractFromUrn(postUrl);
    }
  }

  // Media type detection
  let mediaType = undefined;
  if (postEl.querySelector("video, [data-test-id='video-player'], .video-js, [class*='video']")) {
    mediaType = "video";
  } else if (
    postEl.querySelector("[class*='carousel'], [data-test-id='carousel'], .pv-document-viewer") ||
    postEl.querySelectorAll(".update-components-image img, [class*='feed-shared-image']").length > 1
  ) {
    mediaType = "carousel";
  } else if (postEl.querySelector(".update-components-image, .feed-shared-image, [class*='feed-shared-image']")) {
    mediaType = "photo";
  }

  // ogImage — first post image (skip small avatars/profile photos)
  let ogImage = "";
  const images = postEl.querySelectorAll("img");
  for (const img of images) {
    const src = img.getAttribute("src") ?? "";
    const w = img.naturalWidth || parseInt(img.getAttribute("width") ?? "0");
    if (src && !src.includes("data:") && w !== 1 && (w === 0 || w > 80)) {
      ogImage = src;
      break;
    }
  }

  return {
    content: content || undefined,
    authorName: authorName || undefined,
    authorUrl: authorUrl || undefined,
    postUrl: postUrl || undefined,
    embedUrl: embedUrl || undefined,
    mediaType: mediaType || undefined,
    ogImage: ogImage || undefined,
  };
}

function showNotesOverlay(postData, btn, onSubmit) {
  // Remove any existing overlay
  document.getElementById("koomastu-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "koomastu-overlay";
  overlay.innerHTML = `
    <div id="koomastu-dialog">
      <div id="koomastu-dialog-header">
        <span>Save to koomastudio</span>
        <button id="koomastu-close" aria-label="Cancel">✕</button>
      </div>
      ${postData.authorName ? `<p id="koomastu-author">by ${postData.authorName}${postData.mediaType ? ` · <span class="koomastu-tag">${postData.mediaType}</span>` : ""}</p>` : ""}
      <div id="koomastu-tag-row">
        <input id="koomastu-tag-input" type="text" placeholder="Add tags…" />
        <button id="koomastu-tag-add">Add</button>
      </div>
      <div id="koomastu-tags"></div>
      <textarea id="koomastu-notes" placeholder="Add notes…" rows="3"></textarea>
      <div id="koomastu-dialog-footer">
        <button id="koomastu-cancel">Cancel</button>
        <button id="koomastu-confirm">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const textarea = overlay.querySelector("#koomastu-notes");
  const tagInput = overlay.querySelector("#koomastu-tag-input");
  const tagsContainer = overlay.querySelector("#koomastu-tags");
  let tags = [];

  function renderTags() {
    tagsContainer.innerHTML = tags.map((t) => `
      <span class="koomastu-tag-chip">
        ${t}<button data-tag="${t}" aria-label="Remove ${t}">✕</button>
      </span>
    `).join("");
    tagsContainer.querySelectorAll("button[data-tag]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tags = tags.filter((t) => t !== btn.dataset.tag);
        renderTags();
      });
    });
  }

  function addTag() {
    const val = tagInput.value.trim().toLowerCase();
    if (val && !tags.includes(val)) { tags.push(val); renderTags(); }
    tagInput.value = "";
    tagInput.focus();
  }

  overlay.querySelector("#koomastu-tag-add").addEventListener("click", addTag);
  tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
    if (e.key === "Escape") close();
  });

  tagInput.focus();

  function close() {
    overlay.remove();
  }

  overlay.querySelector("#koomastu-close").addEventListener("click", close);
  overlay.querySelector("#koomastu-cancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  overlay.querySelector("#koomastu-confirm").addEventListener("click", () => {
    const notes = textarea.value.trim() || undefined;
    close();
    onSubmit(notes, tags.length > 0 ? tags : undefined);
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      const notes = textarea.value.trim() || undefined;
      close();
      onSubmit(notes, tags.length > 0 ? tags : undefined);
    }
    if (e.key === "Escape") close();
  });
}

async function savePost(postEl, btn) {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    btn.innerHTML = ICON_ARROW + KS_LABEL;
    btn.classList.add("error");
    setTimeout(() => resetBtn(btn), 3000);
    return;
  }

  const postData = extractPostData(postEl);

  if (!postData.content) {
    btn.innerHTML = ICON_ARROW + KS_LABEL;
    btn.classList.add("error");
    setTimeout(() => resetBtn(btn), 3000);
    return;
  }

  showNotesOverlay(postData, btn, (notes, tags) => {
    btn.innerHTML = ICON_SPIN + KS_LABEL;
    btn.classList.add("saving");
    btn.disabled = true;

    chrome.runtime.sendMessage(
      { type: "SAVE_POST", payload: { token, postData: { ...postData, notes, tags } } },
      (response) => {
        if (response?.success) {
          btn.innerHTML = ICON_CHECK + KS_LABEL;
          btn.classList.remove("saving");
          btn.classList.add("saved");
          showToast(postData.authorName);
          setTimeout(() => resetBtn(btn), 3000);
        } else {
          btn.innerHTML = ICON_ARROW + KS_LABEL;
          btn.classList.remove("saving");
          btn.classList.add("error");
          btn.disabled = false;
          setTimeout(() => resetBtn(btn), 4000);
        }
      },
    );
  });
}

function showToast(authorName) {
  let toast = document.getElementById("koomastu-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "koomastu-toast";
    toast.innerHTML = `
      <span id="koomastu-toast-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <div>
        <div id="koomastu-toast-msg">Saved to koomastudio</div>
        <div id="koomastu-toast-sub"></div>
      </div>
    `;
    document.body.appendChild(toast);
  }

  toast.querySelector("#koomastu-toast-sub").textContent = authorName ? `by ${authorName}` : "";

  clearTimeout(toast._hideTimer);
  toast.classList.add("show");
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function resetBtn(btn) {
  btn.innerHTML = ICON_ARROW + KS_LABEL;
  btn.classList.remove("saving", "saved", "error");
  btn.disabled = false;
}

function injectButton(postEl) {
  if (postEl.hasAttribute(BUTTON_ATTR)) return;
  postEl.setAttribute(BUTTON_ATTR, "true");

  // Find the action bar (like/comment/share row)
  const actionBar =
    postEl.querySelector(".feed-shared-social-action-bar") ??
    postEl.querySelector(".social-actions-bar") ??
    postEl.querySelector("[data-test-id='social-actions']") ??
    postEl.querySelector(".update-v2-social-activity");

  if (!actionBar) return;

  const btn = document.createElement("button");
  btn.className = SAVE_BTN_CLASS;
  btn.innerHTML = ICON_ARROW + KS_LABEL;
  btn.setAttribute("aria-label", "Save to koomastudio");
  btn.setAttribute("title", "Save to koomastudio");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    void savePost(postEl, btn);
  });

  actionBar.appendChild(btn);
}

function scanForPosts() {
  // Main feed posts
  document
    .querySelectorAll(
      ".feed-shared-update-v2:not([data-koomastu-injected]), .update-components-update-v2:not([data-koomastu-injected])",
    )
    .forEach(injectButton);
}

// Initial scan
scanForPosts();

// Watch for new posts loaded dynamically
const observer = new MutationObserver(() => {
  scanForPosts();
});

observer.observe(document.body, { childList: true, subtree: true });
