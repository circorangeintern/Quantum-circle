/**
 * Smoke test — verifies that the test infrastructure (Vitest + MSW) is wired
 * correctly before any feature tests are written.
 */
import { describe, it, expect } from "vitest";
import { server } from "./mocks/server.js";
import { http, HttpResponse } from "msw";

describe("Test infrastructure smoke test", () => {
  it("msw server is defined and started", () => {
    expect(server).toBeDefined();
  });

  it("can intercept a GET request via msw", async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    // Override the default handler for this single test
    server.use(
      http.get(`${BASE_URL}/auth/me`, () => {
        return HttpResponse.json({ admin: { id: "smoke-test-user" } }, { status: 200 });
      }),
    );

    const res = await fetch(`${BASE_URL}/auth/me`);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.admin.id).toBe("smoke-test-user");
  });

  it("default POST /auth/login handler returns a 200 with tokens", async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "password" }),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.tokens).toHaveProperty("accessToken");
    expect(json.tokens).toHaveProperty("refreshToken");
  });
});
