/**
 * Per-repository public "live demo" URLs.
 *
 * GitHub's Deployments API only exposes the hosting *dashboard* URL (e.g. a
 * `railway.com/project/...` link), not the public production domain. Map each
 * repo name (exactly as it appears on GitHub) to its public site here so the
 * "View demo" button opens the actual live app.
 *
 * Setting the repo's `homepage` field on GitHub achieves the same thing and is
 * picked up automatically — this map overrides that when needed.
 */
export const LIVE_URL_OVERRIDES: Record<string, string> = {
  Concierge: "https://personal-assistant.up.railway.app",
  FlagShip: "https://mitchelturner.dev",
  DeadReckoning: "https://captains-schedule-production.up.railway.app",
  "Viral-Loops": "https://viral-loops-production.up.railway.app",
  "Salmon-Run": "https://salmon-ar-production.up.railway.app",
};

/**
 * True when `url` is a public site visitors can open — not a Railway/GitHub
 * dashboard, repo page, or other private hosting console.
 */
export function isPublicLiveUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  // Railway project dashboard (login-gated), not the deployed app.
  if (host === "railway.com" || host === "railway.app" || host === "www.railway.app") {
    return false;
  }
  // GitHub repo / deployments UI — never a live demo.
  if (host === "github.com" || host === "www.github.com") {
    return false;
  }
  return true;
}

/**
 * Resolve the best public live-demo URL for a repo.
 * Order: explicit override → GitHub homepage → deployment URL → GitHub Pages.
 * Dashboard / console URLs are discarded.
 */
export function resolveLiveUrl(repo: {
  name: string;
  homepage: string | null;
  pagesUrl: string | null;
  deployment: { url: string | null } | null;
}): string | null {
  const candidates = [
    LIVE_URL_OVERRIDES[repo.name],
    repo.homepage,
    repo.deployment?.url,
    repo.pagesUrl,
  ];
  for (const candidate of candidates) {
    if (isPublicLiveUrl(candidate)) return candidate;
  }
  return null;
}
