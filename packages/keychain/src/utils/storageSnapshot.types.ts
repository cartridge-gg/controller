/**
 * Options for creating a localStorage snapshot cookie
 */
export interface SnapshotOptions {
  /**
   * Name of the cookie to create
   * @default "keychain_ls_snapshot"
   */
  cookieName?: string;

  /**
   * Cookie path (should be a dead path that never matches any route)
   * @default "/__snapshot_never_hit__"
   */
  cookiePath?: string;

  /**
   * Cookie expiration time in seconds
   * @default 300 (5 minutes)
   */
  maxAgeSeconds?: number;
}

/**
 * Options for restoring localStorage from a snapshot cookie
 */
export interface RestoreOptions {
  /**
   * Name of the cookie to read
   * @default "keychain_ls_snapshot"
   */
  cookieName?: string;

  /**
   * Cookie path
   * @default "/__snapshot_never_hit__"
   */
  cookiePath?: string;

  /**
   * Whether to clear the cookie after restoring
   * @default true
   */
  clearAfterRestore?: boolean;
}

/**
 * Options for clearing a snapshot cookie
 */
export interface ClearOptions {
  /**
   * Name of the cookie to clear
   * @default "keychain_ls_snapshot"
   */
  cookieName?: string;

  /**
   * Cookie path
   * @default "/__snapshot_never_hit__"
   */
  cookiePath?: string;
}
