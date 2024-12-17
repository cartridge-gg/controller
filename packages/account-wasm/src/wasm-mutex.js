function releaseStub() {}

export class Mutex {
  lastPromise = Promise.resolve();

  async obtain() {
    let release = releaseStub;
    const lastPromise = this.lastPromise;
    this.lastPromise = new Promise((resolve) => (release = resolve));
    await lastPromise;
    return release;
  }
}
