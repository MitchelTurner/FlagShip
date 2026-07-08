/**
 * Contact form API
 *
 * POST /api/contact — validate a submission and forward it to the site owner.
 * Returns { ok: true } on success, or { error, code } with a non-2xx status.
 * When email isn't configured, responds 503 with code "not_configured" so the
 * client can offer a mailto fallback.
 */
import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact";

export const dynamic = "force-dynamic";

const NAME_MAX = 120;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 5000;
const MESSAGE_MIN = 10;

// Best-effort per-IP rate limit (in-memory; resets on cold start).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again shortly.", code: "rate_limited" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  // Honeypot: real users leave this hidden field empty.
  if (asString(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const message = asString(body.message);

  if (!name || name.length > NAME_MAX) {
    return NextResponse.json(
      { error: "Please enter your name.", code: "invalid_name" },
      { status: 400 },
    );
  }
  if (!email || email.length > EMAIL_MAX || !isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address.", code: "invalid_email" },
      { status: 400 },
    );
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return NextResponse.json(
      {
        error: `Message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`,
        code: "invalid_message",
      },
      { status: 400 },
    );
  }

  const result = await sendContactEmail({ name, email, message });

  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        {
          error: "Email delivery isn't configured yet.",
          code: "not_configured",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not send your message. Please email me directly.", code: "send_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
