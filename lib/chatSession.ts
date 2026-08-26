import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';

export const CHAT_SESSION_COOKIE = 'webgiare-chat-session';

const SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSigningSecret() {
  return process.env.CHAT_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function signSessionId(sessionId: string) {
  const secret = getSigningSecret();
  if (!secret) return '';
  return createHmac('sha256', secret).update(sessionId).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function readGuestChatSession(request: NextRequest) {
  const cookie = request.cookies.get(CHAT_SESSION_COOKIE)?.value || '';
  const separator = cookie.lastIndexOf('.');
  if (separator <= 0) return null;

  const sessionId = cookie.slice(0, separator);
  const signature = cookie.slice(separator + 1);
  const expectedSignature = signSessionId(sessionId);

  if (!SESSION_ID_PATTERN.test(sessionId) || !signature || !expectedSignature) return null;
  return safeEqual(signature, expectedSignature) ? sessionId : null;
}

export function createGuestChatSession() {
  const sessionId = randomUUID();
  const signature = signSessionId(sessionId);
  return signature ? { sessionId, cookieValue: `${sessionId}.${signature}` } : null;
}

export function attachGuestChatSessionCookie(response: NextResponse, cookieValue: string) {
  response.cookies.set(CHAT_SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}
