export function isSignedUp() {
  console.log("isSignedUp", document.cookie.search("controller=1") >= 0);
  return document.cookie.search("controller=1") >= 0;
}

export function setIsSignedUp() {
  if (isSignedUp()) {
    return;
  }

  console.log("BEFORE setIsSignupUp", document.cookie);
  document.cookie = "controller=1;";
  console.log("AFTER setIsSignupUp", document.cookie);
}
