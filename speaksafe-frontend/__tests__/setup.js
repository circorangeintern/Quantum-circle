import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { server } from "./mocks/server.js";

// Start the MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test to prevent state leakage
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close the server after all tests
afterAll(() => server.close());
