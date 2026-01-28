import { z } from 'zod';

/**
 * Common validation schemas for API routes
 * Use these schemas to validate all input
 */

// Transaction ID: txn_uuid_timestamp (updated format)
export const TransactionIdSchema = z.string()
  .min(1, 'Transaction ID is required')
  .max(100, 'Transaction ID too long')
  .regex(/^txn_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_\d+$/, 
    'Invalid transaction ID format');

// Legacy transaction ID format (for backward compatibility during migration)
export const LegacyTransactionIdSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^txn_\d+_[a-zA-Z0-9_-]+$/);

// Offer ID: alphanumeric with hyphens/underscores
export const OfferIdSchema = z.string()
  .min(1, 'Offer ID is required')
  .max(100, 'Offer ID too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid offer ID format');

// Email: RFC 5322 compliant
export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .toLowerCase()
  .trim();

// Full name: letters, spaces, hyphens, apostrophes
export const FullNameSchema = z.string()
  .min(1, 'Name is required')
  .max(200, 'Name too long')
  .regex(/^[\p{L}\s'-]+$/u, 'Invalid name format')
  .trim();

// Payment Intent ID: Stripe format
export const PaymentIntentIdSchema = z.string()
  .min(1, 'Payment intent ID is required')
  .max(200, 'Payment intent ID too long')
  .regex(/^pi_[a-zA-Z0-9_]+$/, 'Invalid payment intent ID format');

// Session ID: Stripe format
export const SessionIdSchema = z.string()
  .min(1, 'Session ID is required')
  .max(200, 'Session ID too long')
  .regex(/^cs_[a-zA-Z0-9_]+$/, 'Invalid session ID format');

// Discount code
export const DiscountCodeSchema = z.string()
  .max(50, 'Discount code too long')
  .regex(/^[A-Z0-9_-]+$/, 'Invalid discount code format')
  .optional();

// Cart item
export const CartItemSchema = z.object({
  offerId: OfferIdSchema,
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Quantity cannot exceed 10'),
  name: z.string().max(200).optional(),
  priceLabel: z.string().max(40).optional(),
});

// Create Payment Intent
export const CreatePaymentIntentSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  discountCode: DiscountCodeSchema,
});

// Update Payment Intent
export const UpdatePaymentIntentSchema = z.object({
  paymentIntentId: PaymentIntentIdSchema,
  email: EmailSchema,
  fullName: FullNameSchema.optional(),
});

// Create Cart Payment Intent
export const CreateCartPaymentIntentSchema = z.object({
  items: z.array(CartItemSchema)
    .min(1, 'Cart cannot be empty')
    .max(10, 'Cart cannot have more than 10 items'),
  recipientEmail: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  discountCode: DiscountCodeSchema,
  cartToken: z.string().max(128).optional(),
});

// Create Review
export const CreateReviewSchema = z.object({
  transactionId: z.union([TransactionIdSchema, LegacyTransactionIdSchema]),
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string().max(120).optional(),
  body: z.string().max(1000).optional(),
});

// Query: By Session
export const BySessionQuerySchema = z.object({
  session_id: SessionIdSchema.optional(),
  payment_intent: PaymentIntentIdSchema.optional(),
}).refine(
  (data) => data.session_id || data.payment_intent,
  { message: "Either session_id or payment_intent is required" }
);

// Query: Checkout Session
export const CheckoutSessionQuerySchema = z.object({
  session_id: SessionIdSchema,
});

// Create Order
export const CreateOrderSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema,
  fullName: FullNameSchema,
});

// Create Checkout Session
export const CreateCheckoutSessionSchema = z.object({
  offerId: OfferIdSchema,
  recipientEmail: EmailSchema,
  fullName: FullNameSchema,
});

// Cart Reminders
export const CartRemindersSchema = z.object({
  email: EmailSchema,
  items: z.array(CartItemSchema)
    .min(1, 'Cart cannot be empty')
    .max(10, 'Cart cannot have more than 10 items'),
  token: z.string().max(128).optional(),
});
