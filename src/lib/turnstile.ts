/**
 * Cloudflare Turnstile Verification
 * Server-side verification of Turnstile tokens
 */

/**
 * Verify Turnstile token
 */
export async function verifyTurnstileToken(
  token: string,
  userIP?: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("[Turnstile] Secret key not configured");
    return { success: false, error: "Turnstile not configured" };
  }

  if (!token) {
    return { success: false, error: "Token is required" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (userIP) {
      formData.append("remoteip", userIP);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const result = await response.json();

    if (!result.success) {
      const errors = result["error-codes"] || [];
      return {
        success: false,
        error: errors.join(", "),
        details: result,
      };
    }

    return { success: true, details: result };
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Turnstile error codes
 */
export const TURNSTILE_ERRORS: Record<string, string> = {
  "missing-input-secret": "The secret parameter is missing",
  "invalid-input-secret": "The secret parameter is invalid or malformed",
  "missing-input-response": "The response parameter is missing",
  "invalid-input-response": "The response parameter is invalid or malformed",
  "bad-request": "The request is invalid or malformed",
  "timeout-or-duplicate": "The response is no longer valid: either is too old or has been used previously",
  "internal-error": "An internal error happened while validating the response",
};
