import { NextRequest } from "next/server";
import { POST as reviewsPOST } from "@/app/api/reviews/route";

const mockSendReviewDiscountEmail = jest.fn();
const mockCreateDiscountCode = jest.fn();

jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn().mockResolvedValue({ userId: "user_123" }),
}));

jest.mock("@/lib/email", () => ({
  sendReviewDiscountEmail: (...args: any[]) => mockSendReviewDiscountEmail(...args),
}));

jest.mock("@/lib/discounts", () => ({
  createDiscountCode: (...args: any[]) => mockCreateDiscountCode(...args),
}));

jest.mock("@/lib/supabase", () => {
  const chainFor = (table: string) => {
    if (table === "customers") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { email: "test@example.com" }, error: null }),
      };
    }
    if (table === "esim_purchases") {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            transaction_id: "txn_1",
            customer_email: "test@example.com",
            customer_name: "Test User",
          },
          error: null,
        }),
      };
    }
    if (table === "reviews") {
      return {
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    }
    throw new Error("Unexpected table " + table);
  };

  return {
    isSupabaseAdminReady: jest.fn().mockReturnValue(true),
    supabaseAdmin: {
      from: jest.fn().mockImplementation(chainFor),
    },
  };
});

jest.mock("@/lib/security", () => ({
  sanitizeString: (s: string) => s,
}));

describe("POST /api/reviews", () => {
  beforeEach(() => {
    mockSendReviewDiscountEmail.mockReset();
    mockCreateDiscountCode.mockReset();
    mockCreateDiscountCode.mockResolvedValue({
      code: "REVIEW-TEST",
      codeRow: { id: "dc_1" },
    });
    mockSendReviewDiscountEmail.mockResolvedValue(true);
  });

  it("creates review and issues discount", async () => {
    const req = new NextRequest("http://localhost:3000/api/reviews", {
      method: "POST",
      body: JSON.stringify({ transactionId: "txn_1", rating: 5, title: "Great", body: "Nice" }),
      headers: { "content-type": "application/json" },
    });

    const res = await reviewsPOST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.discountCode).toBe("REVIEW-TEST");
    expect(mockCreateDiscountCode).toHaveBeenCalled();
    expect(mockSendReviewDiscountEmail).toHaveBeenCalled();
  });
});

