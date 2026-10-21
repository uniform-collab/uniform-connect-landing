import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

// Sealed (encrypted + signed) cookie that flags a request as being in Uniform
// preview mode. The contents are opaque to the browser and cannot be forged
// without the server-side password, so a visitor can't flip themselves into
// draft mode by hand-crafting a cookie.
export const PREVIEW_COOKIE_NAME = "uniform-preview";

type PreviewSession = {
  preview?: boolean;
};

// The same secret authorizes the inbound /api/preview request (matched against
// the `secret` query param Uniform sends) and seals the cookie. It must
// be at least 32 characters.
function sessionPassword(): string {
  const secret = process.env.UNIFORM_PREVIEW_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "UNIFORM_PREVIEW_SECRET must be set to a string of at least 32 characters to use preview mode."
    );
  }
  return secret;
}

const COOKIE_MAX_AGE_SECONDS = 60 * 60;

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    httpOnly: true,
    // The Canvas editor renders the site inside a cross-origin iframe, so the
    // cookie must be SameSite=None (which in turn requires Secure) in prod.
    // Locally we fall back to Lax over http so the cookie isn't dropped.
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    secure: isProd,
  };
}

// Start no longer ships a session helper, so seal the flag ourselves with
// AES-256-GCM (encrypted + authenticated). Layout: iv | auth tag | ciphertext.
function sealKey(): Buffer {
  return createHash("sha256").update(sessionPassword()).digest();
}

function seal(data: PreviewSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sealKey(), iv);
  const payload = JSON.stringify({
    ...data,
    exp: Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
  });
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function unseal(token: string): PreviewSession {
  const raw = Buffer.from(token, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", sealKey(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  const payload = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
  const { exp, ...data } = JSON.parse(payload.toString("utf8"));
  if (typeof exp !== "number" || exp < Date.now()) {
    throw new Error("Preview cookie expired.");
  }
  return data;
}

// Server-only check used by the composition loader to decide between published
// and draft content. Any failure (missing secret, no/garbled cookie) is treated
// as "not previewing" so normal traffic always gets published content.
export async function isPreview(): Promise<boolean> {
  try {
    const token = getCookie(PREVIEW_COOKIE_NAME);
    return !!token && unseal(token).preview === true;
  } catch {
    return false;
  }
}

// Seal the preview flag into the cookie (called from /api/preview once the
// shared secret has been validated).
export async function enablePreview(): Promise<void> {
  setCookie(PREVIEW_COOKIE_NAME, seal({ preview: true }), {
    ...cookieOptions(),
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

// Clear the preview cookie to leave preview mode.
export async function exitPreview(): Promise<void> {
  deleteCookie(PREVIEW_COOKIE_NAME, cookieOptions());
}
