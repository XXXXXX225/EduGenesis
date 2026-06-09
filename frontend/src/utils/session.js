const ACCESS_TOKEN_KEY = 'accessToken';
const USERNAME_KEY = 'regUsername';
const LOGGED_IN_KEY = 'isLoggedIn';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function isAuthenticated() {
  return Boolean(getAccessToken()) && localStorage.getItem(LOGGED_IN_KEY) === 'true';
}

export function saveSession({ accessToken, username }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(LOGGED_IN_KEY, 'true');
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(LOGGED_IN_KEY);
}
