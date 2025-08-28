// Jest setup file to handle cleanup of timers and open handles

// Mock window.starknet objects for wallet tests
if (typeof window !== "undefined") {
  (window as any).starknet_argentX = undefined;
  (window as any).starknet_braavos = undefined;
}

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
