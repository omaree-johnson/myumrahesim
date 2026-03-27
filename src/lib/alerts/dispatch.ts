import { resend } from "@/lib/email";
import { retryWithBackoff } from "@/lib/retry";
import { secureLog } from "@/lib/secure-logging";
import { AlertPayload, buildAlertSubject, buildAlertText } from "@/lib/alerts/templates";

const dedupCache = new Map<string, number>();
const DEFAULT_THROTTLE_MS = 10 * 60 * 1000;

function getAdminAlertRecipients(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getAlertFromAddress(): string {
  return process.env.EMAIL_FROM || "security@myumrahesim.com";
}

function dedupKey(payload: AlertPayload): string {
  return `${payload.category}:${payload.event}:${payload.userId || "anonymous"}:${payload.ip || "unknown"}`;
}

export function shouldSendAlert(payload: AlertPayload, now = Date.now(), throttleMs = DEFAULT_THROTTLE_MS): boolean {
  const key = dedupKey(payload);
  const previous = dedupCache.get(key);
  if (typeof previous === "number" && now - previous < throttleMs) {
    return false;
  }
  dedupCache.set(key, now);
  return true;
}

export async function dispatchSecurityAlert(payload: AlertPayload): Promise<{ delivered: boolean; reason?: string }> {
  try {
    const recipients = getAdminAlertRecipients();
    if (recipients.length === 0) {
      return { delivered: false, reason: "no-recipients" };
    }

    if (!shouldSendAlert(payload)) {
      return { delivered: false, reason: "throttled" };
    }

    const subject = buildAlertSubject(payload);
    const text = buildAlertText(payload);

    await retryWithBackoff(
      async () => {
        await resend.emails.send({
          from: getAlertFromAddress(),
          to: recipients,
          subject,
          text,
        });
      },
      3,
      500
    );

    return { delivered: true };
  } catch (error) {
    secureLog("error", "[Alerts] Failed to dispatch alert", {
      event: payload.event,
      category: payload.category,
      error: error instanceof Error ? error.message : String(error),
    });
    return { delivered: false, reason: "dispatch-error" };
  }
}

export function clearAlertDedupCacheForTests(): void {
  dedupCache.clear();
}
