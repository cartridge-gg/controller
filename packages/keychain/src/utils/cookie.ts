export function isSignedUp() {
  return document.cookie.search("controller=1") >= 0;
}

export function setIsSignedUp() {
  if (isSignedUp()) {
    return;
  }

  document.cookie = `controller=1;${document.cookie}`;
}
