/**
 * Dynamic OG image generator for external-site cards ("Other sites").
 *
 * GET /api/og/site?name=&desc=&role=&year=&host=&tags=
 * Matches the Live Work /api/og/repo visual language: dark canvas, hashed
 * ocean-depth gradient orbs, large title, short description, tag pills.
 */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

// Same ocean-depth palette as /api/og/repo so both grids feel like one system.
const GRADIENTS: [string, string][] = [
  ["#0ea5e9", "#5eead4"],
  ["#0284c7", "#22d3ee"],
  ["#0d9488", "#22d3ee"],
  ["#1d4ed8", "#22d3ee"],
  ["#7c3aed", "#22d3ee"],
  ["#0891b2", "#5eead4"],
  ["#075985", "#34d399"],
  ["#2563eb", "#5eead4"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "site").slice(0, 40);
  const desc = (searchParams.get("desc") ?? "").slice(0, 130);
  const role = (searchParams.get("role") ?? "Live site").slice(0, 40);
  const year = (searchParams.get("year") ?? "").slice(0, 12);
  const host = (searchParams.get("host") ?? "").slice(0, 48);
  const tags = (searchParams.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [c1, c2] = GRADIENTS[hash(name) % GRADIENTS.length];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#04070f",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: c1,
            opacity: 0.45,
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: c2,
            opacity: 0.4,
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 30 }}>
            {role}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            {name}
          </div>
          {desc ? (
            <div
              style={{
                fontSize: 32,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.35,
                display: "flex",
                maxWidth: 980,
              }}
            >
              {desc}
            </div>
          ) : null}
          {tags.length ? (
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    fontSize: 24,
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 9999,
                    padding: "6px 18px",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {year ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(255,255,255,0.85)",
                fontSize: 30,
              }}
            >
              <span>{year}</span>
            </div>
          ) : null}
          {host ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(255,255,255,0.85)",
                fontSize: 30,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
              <span>{host}</span>
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
