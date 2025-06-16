// Jest setup file to handle cleanup of timers and open handles

// Mock starknetkit to prevent it from creating timers
jest.mock("starknetkit", () => ({
  connect: jest.fn(),
  StarknetWindowObject: {},
}));

jest.mock("starknetkit/injected", () => ({
  InjectedConnector: jest.fn(),
}));

// Clean up any remaining timers after each test
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Force cleanup after all tests
afterAll(() => {
  // Clear any remaining timers
  jest.clearAllTimers();
  jest.useRealTimers();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});
