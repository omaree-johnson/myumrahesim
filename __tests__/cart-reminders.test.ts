import { NextRequest } from "next/server";
import { POST as remindersPOST } from "@/app/api/cart/reminders/route";

const mockSend = jest.fn();

jest.mock("@/lib/email", () => ({
  resend: {
    emails: {
      send: (...args: any[]) => mockSend(...args),
      cancel: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase", () => {
  const state: any = {
    session: {
      id: "cs_1",
      token: "tok_1",
      email: "test@example.com",
      converted_at: null,
      reminder1_email_id: null,
      reminder2_email_id: null,
      reminder1_scheduled_at: null,
      reminder2_scheduled_at: null,
    },
    updated: [],
  };

  return {
    isSupabaseAdminReady: jest.fn().mockReturnValue(true),
    supabaseAdmin: {
      from: jest.fn().mockImplementation((table: string) => {
        if (table !== "cart_sessions") throw new Error("Unexpected table " + table);
        return {
          upsert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: state.session, error: null }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockImplementation(async (_col: string, _val: string) => {
              state.updated.push(true);
              return { data: null, error: null };
            }),
          }),
        };
      }),
    },
    __state: state,
  };
});

jest.mock("@/lib/security", () => ({
  sanitizeString: (s: string) => s,
  isValidEmail: () => true,
  checkRateLimit: () => ({ allowed: true, remaining: 9, resetAt: Date.now() + 60000 }),
  getClientIP: () => "127.0.0.1",
}));

describe("POST /api/cart/reminders", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend
      .mockResolvedValueOnce({ data: { id: "email_1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "email_2" }, error: null });
  });

  it("schedules two emails and returns token", async () => {
    const req = new NextRequest("http://localhost:3000/api/cart/reminders", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        token: "tok_1",
        items: [{ offerId: "CKH001", name: "Plan", priceLabel: "USD 10.00", quantity: 1 }],
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await remindersPOST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.token).toBe("tok_1");
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});

