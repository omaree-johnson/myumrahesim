jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: {
    slidingWindow: jest.fn(() => ({})),
  },
}));

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn(() => ({
    zadd: jest.fn(),
    zremrangebyscore: jest.fn(),
    zcard: jest.fn().mockResolvedValue(0),
    expire: jest.fn(),
  })),
}));

import { detectBotSignals, logAbuseEvent } from "@/lib/bot-protection";

jest.mock("@/lib/monitoring", () => ({
  logAbuseEvent: jest.fn(),
}));

const { logAbuseEvent: logMonitoringAbuse } = jest.requireMock("@/lib/monitoring") as {
  logAbuseEvent: jest.Mock;
};

describe("bot telemetry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("computes rapid-request signal using deterministic fallback when Redis unavailable", async () => {
    const baseUrl = `http://localhost:3000/api/test-${Date.now()}`;
    const headers = {
      "user-agent": "Mozilla/5.0",
      "x-forwarded-for": "100.64.1.10",
      cookie: "sid=abc",
      referer: "http://localhost:3000/",
    };

    const first = await detectBotSignals(new Request(baseUrl, { method: "GET", headers }));
    expect(first.rapidRequests).toBe(false);

    let burst = first;
    for (let i = 0; i < 9; i++) {
      burst = await detectBotSignals(new Request(baseUrl, { method: "GET", headers }));
    }

    expect(burst.rapidRequests).toBe(true);
    expect(burst.score).toBeGreaterThan(0);
  });

  it("fails open when abuse logging sink throws", async () => {
    logMonitoringAbuse.mockRejectedValueOnce(new Error("sink down"));

    await expect(
      logAbuseEvent({
        type: "rate_limit_exceeded",
        identifier: "ip:1.2.3.4",
        ip: "1.2.3.4",
        endpoint: "/api/orders",
        reason: "Rate limit exceeded",
      })
    ).resolves.toBeUndefined();
  });
});
