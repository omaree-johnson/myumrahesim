import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/stripe/route";
import { handlePaymentIntentSucceeded } from "@/lib/webhooks/stripe/handlers/payment-intent-succeeded";
import { handlePaymentFailedOrCanceled } from "@/lib/webhooks/stripe/handlers/payment-failed";

jest.mock("@/lib/webhooks/stripe/verify-signature", () => ({
  verifyStripeSignature: jest.fn(),
}));
jest.mock("@/lib/webhooks/stripe/services/persistence", () => ({
  logStripeWebhookEvent: jest.fn(),
  logStripePaymentAction: jest.fn(),
  markStripeWebhookProcessed: jest.fn(),
}));
jest.mock("@/lib/webhooks/stripe/router", () => ({
  routeStripeWebhookEvent: jest.fn(),
}));
jest.mock("@/lib/webhooks/stripe/orchestrators/fulfillment", () => ({
  processPaymentAndFulfill: jest.fn(),
}));
jest.mock("@/lib/webhooks/stripe/services/idempotency", () => ({
  findExistingPurchaseByPaymentIntent: jest.fn(),
}));
jest.mock("@/lib/discounts", () => ({
  releaseDiscountReservationForPaymentIntent: jest.fn(),
}));

const { verifyStripeSignature } = jest.requireMock("@/lib/webhooks/stripe/verify-signature") as {
  verifyStripeSignature: jest.Mock;
};
const { logStripeWebhookEvent, logStripePaymentAction, markStripeWebhookProcessed } = jest.requireMock(
  "@/lib/webhooks/stripe/services/persistence"
) as {
  logStripeWebhookEvent: jest.Mock;
  logStripePaymentAction: jest.Mock;
  markStripeWebhookProcessed: jest.Mock;
};
const { routeStripeWebhookEvent } = jest.requireMock("@/lib/webhooks/stripe/router") as {
  routeStripeWebhookEvent: jest.Mock;
};
const { processPaymentAndFulfill } = jest.requireMock("@/lib/webhooks/stripe/orchestrators/fulfillment") as {
  processPaymentAndFulfill: jest.Mock;
};
const { findExistingPurchaseByPaymentIntent } = jest.requireMock("@/lib/webhooks/stripe/services/idempotency") as {
  findExistingPurchaseByPaymentIntent: jest.Mock;
};
const { releaseDiscountReservationForPaymentIntent } = jest.requireMock("@/lib/discounts") as {
  releaseDiscountReservationForPaymentIntent: jest.Mock;
};

describe("Stripe webhook regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles valid signature and success flow", async () => {
    verifyStripeSignature.mockReturnValueOnce({
      id: "evt_1",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1" } },
    });
    routeStripeWebhookEvent.mockResolvedValueOnce(
      Response.json({ received: true, success: true, transactionId: "txn_1", status: "PROCESSING" })
    );

    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "payload",
      headers: { "stripe-signature": "sig" },
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(logStripeWebhookEvent).toHaveBeenCalledWith(
      expect.objectContaining({ id: "evt_1", type: "payment_intent.succeeded" })
    );
    expect(body.success).toBe(true);
  });

  it("returns duplicate response for idempotent replay", async () => {
    findExistingPurchaseByPaymentIntent.mockResolvedValueOnce({
      id: "1",
      transaction_id: "txn_existing",
      esim_provider_status: "GOT_RESOURCE",
      order_no: "ORD123",
    });

    const event = {
      id: "evt_dup",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_existing",
          amount: 1000,
          currency: "usd",
          metadata: {},
        },
      },
    } as any;

    const res = await handlePaymentIntentSucceeded(event);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.duplicate).toBe(true);
    expect(body.transactionId).toBe("txn_existing");
    expect(processPaymentAndFulfill).not.toHaveBeenCalled();
  });

  it("returns 200 for payment failure/cancel path", async () => {
    releaseDiscountReservationForPaymentIntent.mockResolvedValueOnce(undefined);
    logStripePaymentAction.mockResolvedValueOnce(undefined);
    markStripeWebhookProcessed.mockResolvedValueOnce(undefined);

    const event = {
      id: "evt_failed",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: "pi_failed",
          amount: 1000,
          currency: "usd",
          metadata: { transactionId: "txn_failed" },
        },
      },
    } as any;

    const res = await handlePaymentFailedOrCanceled(event);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ received: true });
    expect(releaseDiscountReservationForPaymentIntent).toHaveBeenCalledWith("pi_failed");
  });
});
