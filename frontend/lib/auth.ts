export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const TOKEN_COOKIE = "token";
export const EMAIL_COOKIE = "email";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; max-age=${maxAge}`;
}

function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function setSession(token: string, email: string) {
  writeCookie(TOKEN_COOKIE, token, THIRTY_DAYS);
  writeCookie(EMAIL_COOKIE, email, THIRTY_DAYS);
}

export function getToken() {
  return readCookie(TOKEN_COOKIE);
}

export function clearSession() {
  writeCookie(TOKEN_COOKIE, "", 0);
  writeCookie(EMAIL_COOKIE, "", 0);
}
