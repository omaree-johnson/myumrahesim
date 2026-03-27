import { clearAlertDedupCacheForTests, dispatchSecurityAlert } from "@/lib/alerts/dispatch";
import { logStructuredEvent } from "@/lib/monitoring";

jest.mock("@/lib/email", () => ({
  resend: {
    emails: {
      send: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase", () => ({
  isSupabaseAdminReady: jest.fn().mockReturnValue(true),
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

const { resend } = jest.requireMock("@/lib/email") as {
  resend: {
    emails: {
      send: jest.Mock;
    };
  };
};

describe("alert dispatch", () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    jest.clearAllMocks();
    clearAlertDedupCacheForTests();
    process.env.ADMIN_EMAILS = "admin@example.com";
  });

  afterAll(() => {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  });

  it("sends alert via Resend and throttles duplicates", async () => {
    resend.emails.send.mockResolvedValueOnce({ id: "mail_1" });

    const first = await dispatchSecurityAlert({
      severity: "high",
      category: "security",
      event: "suspicious_login",
      message: "Suspicious login detected",
      userId: "user_1",
      ip: "1.2.3.4",
    });

    const second = await dispatchSecurityAlert({
      severity: "high",
      category: "security",
      event: "suspicious_login",
      message: "Suspicious login detected",
      userId: "user_1",
      ip: "1.2.3.4",
    });

    expect(first.delivered).toBe(true);
    expect(second.delivered).toBe(false);
    expect(second.reason).toBe("throttled");
  });

  it("fails open when transport errors", async () => {
    resend.emails.send.mockRejectedValue(new Error("transport down"));

    const result = await dispatchSecurityAlert({
      severity: "critical",
      category: "security",
      event: "incident",
      message: "Critical incident",
    });

    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("dispatch-error");
  });

  it("monitoring trigger path remains fail-open when alert dispatch fails", async () => {
    resend.emails.send.mockRejectedValue(new Error("email down"));

    await expect(
      logStructuredEvent({
        timestamp: new Date().toISOString(),
        level: "error",
        category: "security",
        event: "security_test",
        message: "alert flow",
        severity: "high",
        requiresAlert: true,
      })
    ).resolves.toBeUndefined();
  });
});
