type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; code: "missing-config" | "missing-token" | "verify-failed" };

/**
 * Verifies a Turnstile token with Cloudflare. Must only run on the server.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("TURNSTILE_SECRET_KEY is not configured.");
      return { ok: false, code: "missing-config" };
    }
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, code: "missing-token" };
  }

  let response: Response;
  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token.trim(),
        }),
      }
    );
  } catch (error) {
    console.error("Turnstile siteverify request failed:", error);
    return { ok: false, code: "verify-failed" };
  }

  if (!response.ok) {
    return { ok: false, code: "verify-failed" };
  }

  const data = (await response.json()) as TurnstileVerifyResponse;
  if (data.success !== true) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Turnstile verify error-codes:", data["error-codes"]);
    }
    return { ok: false, code: "verify-failed" };
  }

  return { ok: true };
}
