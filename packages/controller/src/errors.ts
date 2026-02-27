export class NotReadyToConnect extends Error {
  constructor() {
    super("Not ready to connect");

    Object.setPrototypeOf(this, NotReadyToConnect.prototype);
  }
}

export class HeadlessAuthenticationError extends Error {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = "HeadlessAuthenticationError";

    Object.setPrototypeOf(this, HeadlessAuthenticationError.prototype);
  }
}

export class InvalidCredentialsError extends HeadlessAuthenticationError {
  constructor(credentialType: string) {
    super(`Invalid credentials provided for type: ${credentialType}`);
    this.name = "InvalidCredentialsError";

    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class HeadlessModeNotSupportedError extends Error {
  constructor(operation: string) {
    super(`Operation "${operation}" is not supported in headless mode`);
    this.name = "HeadlessModeNotSupportedError";

    Object.setPrototypeOf(this, HeadlessModeNotSupportedError.prototype);
  }
}
