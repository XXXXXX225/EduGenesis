const ACCESS_TOKEN_KEY = 'accessToken';
const USERNAME_KEY = 'regUsername';
const LOGGED_IN_KEY = 'isLoggedIn';

// 使用 sessionStorage 或 localStorage，取决于是否记住凭证。
// 默认情况下使用 sessionStorage 降低 XSS 窃取 token 风险。
const session = window.sessionStorage;
const local = window.localStorage;

export function getAccessToken() {
  return local.getItem(ACCESS_TOKEN_KEY) || session.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getStoredUsername() {
  return local.getItem(USERNAME_KEY) || session.getItem(USERNAME_KEY) || '';
}

export function isAuthenticated() {
  const token = getAccessToken();
  const isLoggedIn = local.getItem(LOGGED_IN_KEY) === 'true' || session.getItem(LOGGED_IN_KEY) === 'true';
  return Boolean(token) && isLoggedIn;
}

export function saveSession({ accessToken, username }, remember = false) {
  const storage = remember ? local : session;
  const otherStorage = remember ? session : local;

  // 清除另一个存储以避免状态不一致
  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USERNAME_KEY);
  otherStorage.removeItem(LOGGED_IN_KEY);

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(USERNAME_KEY, username);
  storage.setItem(LOGGED_IN_KEY, 'true');
}

export function clearSession() {
  session.removeItem(ACCESS_TOKEN_KEY);
  session.removeItem(USERNAME_KEY);
  session.removeItem(LOGGED_IN_KEY);
  
  local.removeItem(ACCESS_TOKEN_KEY);
  local.removeItem(USERNAME_KEY);
  local.removeItem(LOGGED_IN_KEY);
}

