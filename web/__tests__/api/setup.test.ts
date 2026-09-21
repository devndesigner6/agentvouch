import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockBootstrapDatabase = vi.fn();

vi.mock("@/lib/databaseBootstrap", () => ({
  bootstrapDatabase: () => mockBootstrapDatabase(),
}));

import { POST } from "@/app/api/setup/route";

function request(
  headers: Record<string, string> = {},
  method: "GET" | "POST" = "POST"
): NextRequest {
  return new NextRequest("https://example.com/api/setup", {
    method,
    headers,
  });
}

describe("POST /api/setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBootstrapDatabase.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("runs the full database bootstrap", async () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("VERCEL_ENV", "");
    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockBootstrapDatabase).toHaveBeenCalledTimes(1);
  });

  it("returns a 500 when bootstrap fails", async () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("VERCEL_ENV", "");
    mockBootstrapDatabase.mockRejectedValue(new Error("boom"));

    const res = await POST(request());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toContain("boom");
  });

  it("fails closed in production when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("VERCEL_ENV", "production");

    const res = await POST(request());

    expect(res.status).toBe(401);
    expect(mockBootstrapDatabase).not.toHaveBeenCalled();
  });

  it("fails closed in preview when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("VERCEL_ENV", "preview");

    const res = await POST(request());

    expect(res.status).toBe(401);
    expect(mockBootstrapDatabase).not.toHaveBeenCalled();
  });

  it("rejects requests without the bearer token when a secret is set", async () => {
    vi.stubEnv("CRON_SECRET", "topsecret");
    vi.stubEnv("VERCEL_ENV", "production");

    const res = await POST(request());

    expect(res.status).toBe(401);
    expect(mockBootstrapDatabase).not.toHaveBeenCalled();
  });

  it("rejects a wrong bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "topsecret");
    vi.stubEnv("VERCEL_ENV", "production");

    const res = await POST(request({ authorization: "Bearer wrong" }));

    expect(res.status).toBe(401);
    expect(mockBootstrapDatabase).not.toHaveBeenCalled();
  });

  it("accepts a valid bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "topsecret");
    vi.stubEnv("VERCEL_ENV", "production");

    const res = await POST(request({ authorization: "Bearer topsecret" }));

    expect(res.status).toBe(200);
    expect(mockBootstrapDatabase).toHaveBeenCalledOnce();
  });
});
