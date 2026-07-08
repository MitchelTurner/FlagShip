/**
 * Optional per-repository "live site" overrides.
 *
 * GitHub's deployment API only exposes the hosting *dashboard* URL (e.g. a
 * `railway.com/project/...` link), not the public production domain. To make a
 * repo's "View deployment" button open the actual live site, map the repo name
 * (exactly as it appears on GitHub) to its public URL here.
 *
 * Setting the repo's `homepage` field on GitHub achieves the same thing and is
 * picked up automatically — this map just lets you override it from the code.
 *
 * Example:
 *   "Concierge": "https://concierge-production.up.railway.app",
 */
export const LIVE_URL_OVERRIDES: Record<string, string> = {};
