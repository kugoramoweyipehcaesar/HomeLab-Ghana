export function getLocal(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Save to localStorage and notify the whole app so other pages
 * (admin + public) refresh immediately without a full reload.
 */
export function setLocal(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
  // Specific + global events for live cross-page sync
  window.dispatchEvent(new CustomEvent(`homelab:${key}`, { detail: value }));
  window.dispatchEvent(new CustomEvent("homelab-data-changed", { detail: { key, value } }));
  // Legacy event names used by existing pages
  if (key === "adminCatalog") window.dispatchEvent(new Event("catalogUpdated"));
  if (key === "cart") window.dispatchEvent(new Event("cartUpdated"));
  if (key === "bookings" || key === "homelab_bookings") {
    window.dispatchEvent(new Event("bookingsUpdated"));
  }
}

/** Subscribe to a localStorage key; returns unsubscribe fn */
export function subscribeLocal(key, callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (e) => {
    if (e.type === `homelab:${key}` || (e.type === "storage" && e.key === key)) {
      callback(getLocal(key));
    }
    if (e.type === "homelab-data-changed" && e.detail?.key === key) {
      callback(e.detail.value ?? getLocal(key));
    }
  };
  window.addEventListener(`homelab:${key}`, handler);
  window.addEventListener("homelab-data-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(`homelab:${key}`, handler);
    window.removeEventListener("homelab-data-changed", handler);
    window.removeEventListener("storage", handler);
  };
}
