export const ADMIN_EMAIL = "kugoramoweyipehcaesar49@gmail.com";
export const ADMIN_PASSWORD = "Dominion4244";
export const SUPER_ADMIN = ADMIN_EMAIL;

export function checkAdmin(email, pass) {
  return email === ADMIN_EMAIL && pass === ADMIN_PASSWORD;
}

/** True if this email is the permanent super admin */
export function isSuperAdminEmail(email) {
  return (email || "").trim().toLowerCase() === SUPER_ADMIN.toLowerCase();
}

/** Staff/account that must never be banned, deleted, or demoted */
export function isProtectedAccount(person) {
  if (!person) return false;
  if (isSuperAdminEmail(person.email)) return true;
  if (person.role === "Super Admin" || person.isSuperAdmin === true) return true;
  return false;
}

/**
 * After login, set session flags. Call from login page.
 */
export function setAdminSession(email) {
  if (typeof window === "undefined") return;
  localStorage.setItem("isAdmin", "true");
  localStorage.setItem("admin_email", email || ADMIN_EMAIL);
}

/**
 * Block banned staff from admin access (except super admin).
 */
export function isBannedStaff(email) {
  if (typeof window === "undefined") return false;
  if (isSuperAdminEmail(email)) return false;
  try {
    const raw =
      localStorage.getItem("homelab_staff") || localStorage.getItem("adminStaff");
    if (!raw) return false;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return false;
    const person = list.find(
      (s) => (s.email || "").toLowerCase() === (email || "").toLowerCase()
    );
    return person?.status === "Banned";
  } catch {
    return false;
  }
}
