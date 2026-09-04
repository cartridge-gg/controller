export const KEYCHAIN_URL = "https://x.cartridge.gg";
export const PROFILE_URL = "https://profile.cartridge.gg";
export const API_URL = "https://api.cartridge.gg";

// Query parameter name used to pass session data via URL redirects.
// Borrowed from Telegram mini app convention, but the choice is arbitrary.
export const REDIRECT_QUERY_NAME = "startapp";

// Query parameter the keychain appends to its redirect target when handing
// control back after a standalone logout / delete-account. The app that opened
// the keychain observes it and clears its own local session/account state (see
// SessionProvider.ingestLogoutFromRedirect). A redirect alone cannot clear the
// app-origin session, so this explicit signal is required.
export const LOGOUT_QUERY_NAME = "controller_logout";
