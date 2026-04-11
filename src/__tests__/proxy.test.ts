import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
}));

const { mockIsRuntimeAnalyticsDisabled } = vi.hoisted(() => ({
  mockIsRuntimeAnalyticsDisabled: vi.fn(),
}));

const { mockRateLimitLimit } = vi.hoisted(() => ({
  mockRateLimitLimit: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/runtime-flags", () => ({
  isRuntimeAnalyticsDisabled: mockIsRuntimeAnalyticsDisabled,
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(_: unknown) {}
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn().mockReturnValue("window");
    limit = mockRateLimitLimit;
  },
}));

async function loadProxyModule() {
  vi.resetModules();
  return import("@/proxy");
}

describe("src/proxy.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");
    mockAuth.mockResolvedValue(null);
    mockIsRuntimeAnalyticsDisabled.mockReturnValue(true);
    mockRateLimitLimit.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60_000,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects unauthenticated users from protected dashboard route", async () => {
    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/signin?callbackUrl=%2Fdashboard",
    );
  });

  it("rewrites locale-prefixed public routes and sets locale cookie", async () => {
    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/hi/pricing");

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toContain("NEXT_LOCALE=hi");
  });

  it("does not rewrite unsupported locale prefixes", async () => {
    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/fr/pricing");

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("redirects non-admin users away from admin routes", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_1", role: "USER" } });

    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/admin");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });

  it("preserves locale prefix in protected-route auth redirects", async () => {
    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/hi/dashboard");

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/hi/auth/signin?callbackUrl=%2Fhi%2Fdashboard",
    );
    expect(response.headers.get("set-cookie")).toContain("NEXT_LOCALE=hi");
  });

  it("allows admin access and applies CSP + security headers", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });

    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/admin");

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'self'",
    );
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("returns 429 for rate-limited API requests when limiter denies traffic", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://upstash.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    mockRateLimitLimit.mockResolvedValue({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 30_000,
    });

    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/api/search", {
      headers: {
        "x-forwarded-for": "203.0.113.44",
      },
    });

    const response = await proxy(request);
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json.error).toBe("Too Many Requests. Please try again later.");
    expect(response.headers.get("x-ratelimit-limit")).toBe("100");
    expect(response.headers.get("x-ratelimit-remaining")).toBe("0");
    expect(response.headers.get("retry-after")).not.toBeNull();
  });

  it("fails closed for payment order API when rate limiter backend is unavailable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://upstash.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    mockRateLimitLimit.mockRejectedValue(new Error("redis unavailable"));

    const { proxy } = await loadProxyModule();
    const request = new NextRequest("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      headers: {
        "x-forwarded-for": "203.0.113.44",
      },
    });

    const response = await proxy(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toContain("verify request limits");
  });
});
