const PREFIX = 'playlistly_';

export function saveToken(provider, tokenData) {
  sessionStorage.setItem(`${PREFIX}${provider}_token`, JSON.stringify(tokenData));
}

export function loadToken(provider) {
  const raw = sessionStorage.getItem(`${PREFIX}${provider}_token`);
  return raw ? JSON.parse(raw) : null;
}

export function removeToken(provider) {
  sessionStorage.removeItem(`${PREFIX}${provider}_token`);
}

export function savePKCE(provider, verifier) {
  sessionStorage.setItem(`${PREFIX}${provider}_pkce`, verifier);
}

export function loadPKCE(provider) {
  return sessionStorage.getItem(`${PREFIX}${provider}_pkce`);
}

export function removePKCE(provider) {
  sessionStorage.removeItem(`${PREFIX}${provider}_pkce`);
}

export function clearAll() {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}
