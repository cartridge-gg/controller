function releaseStub() {}

/**
 * A simple mutual exclusion lock. It allows you to obtain and release a lock,
 *  ensuring that only one task can access a critical section at a time.
 */
export class Mutex {
  private m_lastPromise: Promise<void> = Promise.resolve();

  /**
   * Acquire lock
   * @param [bypass=false] option to skip lock acquisition
   */
  public async obtain(bypass = false): Promise<() => void> {
    let release = releaseStub;
    if (bypass) return release;
    const lastPromise = this.m_lastPromise;
    this.m_lastPromise = new Promise<void>((resolve) => (release = resolve));
    await lastPromise;
    return release;
  }
}
