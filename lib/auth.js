export const ADMIN_EMAIL = "kugoramoweyipehcaesar49@gmail.com";
export const ADMIN_PASSWORD = "Dominion4244";

export function checkAdmin(email, pass) {
  return email === ADMIN_EMAIL && pass === ADMIN_PASSWORD;
}