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
 * Save to localStorage and notify the app.
 * Skips write + events when the serialized value is unchanged
 * (prevents infinite save → event → setState → save loops that freeze the UI).
 */
export function setLocal(key, value) {
  if (typeof window === "undefined") return false;
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }
  try {
    const prev = localStorage.getItem(key);
    if (prev === serialized) return false;
    localStorage.setItem(key, serialized);
  } catch {
    return false;
  }
  try {
    window.dispatchEvent(new CustomEvent(`homelab:${key}`, { detail: value }));
    window.dispatchEvent(new CustomEvent("homelab-data-changed", { detail: { key, value } }));
    if (key === "adminCatalog") window.dispatchEvent(new Event("catalogUpdated"));
    if (key === "cart") window.dispatchEvent(new Event("cartUpdated"));
    if (key === "bookings" || key === "homelab_bookings") {
      window.dispatchEvent(new Event("bookingsUpdated"));
    }
  } catch {
    /* ignore */
  }
  return true;
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
