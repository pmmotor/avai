import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "avai_admin_session";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return password;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidAdminPassword(candidate: string) {
  return safeEqual(candidate, getAdminPassword());
}

export function createAdminSessionToken() {
  return createHmac("sha256", getAdminPassword()).update("avai-admin-session-v1").digest("hex");
}

export async function hasAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(token && safeEqual(token, createAdminSessionToken()));
}

