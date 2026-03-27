import { sanitizeEmail } from "@/lib/secure-logging";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface AlertPayload {
  severity: AlertSeverity;
  category: string;
  event: string;
  message: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  occurredAt?: string;
}

function sanitizeIp(ip?: string): string {
  if (!ip || ip === "unknown") return "unknown";
  const parts = ip.split(".");
  if (parts.length !== 4) return "[redacted]";
  return `${parts[0]}.${parts[1]}.*.*`;
}

function sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> {
  if (!details) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    const normalized = key.toLowerCase();
    if (
      normalized.includes("token") ||
      normalized.includes("secret") ||
      normalized.includes("password") ||
      normalized.includes("key") ||
      normalized.includes("card") ||
      normalized.includes("cvv") ||
      normalized.includes("cvc")
    ) {
      result[key] = "[REDACTED]";
      continue;
    }
    result[key] = value;
  }
  return result;
}

export function buildAlertSubject(payload: AlertPayload): string {
  return `[${payload.severity.toUpperCase()}] ${payload.category}:${payload.event}`;
}

export function buildAlertText(payload: AlertPayload): string {
  const occurredAt = payload.occurredAt || new Date().toISOString();
  const cleanDetails = sanitizeDetails(payload.details);
  return [
    `Severity: ${payload.severity}`,
    `Category: ${payload.category}`,
    `Event: ${payload.event}`,
    `When: ${occurredAt}`,
    `Message: ${payload.message}`,
    `User ID: ${payload.userId || "n/a"}`,
    `Email: ${payload.email ? sanitizeEmail(payload.email) : "n/a"}`,
    `IP: ${sanitizeIp(payload.ip)}`,
    `User-Agent: ${payload.userAgent || "n/a"}`,
    "",
    "Details:",
    JSON.stringify(cleanDetails, null, 2),
  ].join("\n");
}
