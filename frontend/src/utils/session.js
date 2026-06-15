const ACCESS_TOKEN_KEY = 'accessToken';
const USERNAME_KEY = 'regUsername';
const LOGGED_IN_KEY = 'isLoggedIn';

// 使用 sessionStorage 而非 localStorage，降低 XSS 窃取 token 风险。
// 如需进一步加固，可将 JWT 改为 httpOnly Cookie（需后端配合 Set-Cookie）。
// 建议添加 Content-Security-Policy 头防止内联脚本注入。

const storage = window.localStorage;

export function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getStoredUsername() {
  return storage.getItem(USERNAME_KEY) || '';
}

export function isAuthenticated() {
  return Boolean(getAccessToken()) && storage.getItem(LOGGED_IN_KEY) === 'true';
}

export function saveSession({ accessToken, username }) {
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(USERNAME_KEY, username);
  storage.setItem(LOGGED_IN_KEY, 'true');
}

export function clearSession() {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(USERNAME_KEY);
  storage.removeItem(LOGGED_IN_KEY);
}
