import crypto from "crypto";

const secret = process.env.SOCIALPILOT_SESSION_SECRET;
if (!secret) {
  // Do not throw at import time during build; routes validate it when used.
}

function key() {
  if (!secret) throw new Error("SOCIALPILOT_SESSION_SECRET is not configured");
  return crypto.createHash("sha256").update(secret).digest();
}

export function seal(value: unknown) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function open<T>(token: string): T {
  const raw = Buffer.from(token, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
}

export function cookieName(platform: string) { return `sp_connection_${platform}`; }
