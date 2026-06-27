import { resolveGithubUsername } from "./settings";

const API = "https://api.github.com";
// Cache GitHub responses to respect rate limits. Repo lists refresh every 2 min;
// per-repo language data can stay warmer longer.
const REPO_LIST_REVALIDATE = 120;
const REPO_DETAIL_REVALIDATE = 3600;

export interface RepoDeployment {
  environment: string;
  state: string; // success | in_progress | error | pending | inactive ...
  url: string | null;
}

export interface PortfolioRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  languages: { name: string; percent: number }[];
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  pushedAt: string;
  createdAt: string;
  isArchived: boolean;
  hasPages: boolean;
  pagesUrl: string | null;
  deployment: RepoDeployment | null;
}

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
  has_pages: boolean;
  owner: { login: string };
}

function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "mitchelturner-dev",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function pagesUrlFor(repo: RawRepo): string | null {
  if (!repo.has_pages) return null;
  // GitHub Pages default URL. Custom domains aren't exposed here without an
  // extra authenticated call, so the homepage field usually covers those.
  return `https://${repo.owner.login}.github.io/${repo.name}/`;
}

async function fetchLanguages(
  owner: string,
  repo: string,
): Promise<{ name: string; percent: number }[]> {
  try {
    const res = await fetch(`${API}/repos/${owner}/${repo}/languages`, {
      headers: ghHeaders(),
      next: { revalidate: REPO_DETAIL_REVALIDATE },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (!total) return [];
    return Object.entries(data)
      .map(([name, bytes]) => ({
        name,
        percent: Math.round((bytes / total) * 100),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  } catch {
    return [];
  }
}

async function fetchDeployment(
  owner: string,
  repo: string,
): Promise<RepoDeployment | null> {
  // Deployment data requires an API call per repo, so only attempt it when a
  // token is configured (otherwise we'd exhaust the unauthenticated limit).
  if (!process.env.GITHUB_TOKEN?.trim()) return null;
  try {
    const res = await fetch(
      `${API}/repos/${owner}/${repo}/deployments?per_page=1`,
      { headers: ghHeaders(), next: { revalidate: REPO_DETAIL_REVALIDATE } },
    );
    if (!res.ok) return null;
    const deployments = (await res.json()) as {
      id: number;
      environment: string;
    }[];
    if (!deployments.length) return null;
    const latest = deployments[0];

    const statusRes = await fetch(
      `${API}/repos/${owner}/${repo}/deployments/${latest.id}/statuses?per_page=1`,
      { headers: ghHeaders(), next: { revalidate: REPO_DETAIL_REVALIDATE } },
    );
    let state = "active";
    let url: string | null = null;
    if (statusRes.ok) {
      const statuses = (await statusRes.json()) as {
        state: string;
        environment_url: string | null;
        target_url: string | null;
      }[];
      if (statuses.length) {
        state = statuses[0].state;
        url = statuses[0].environment_url || statuses[0].target_url || null;
      }
    }
    return { environment: latest.environment, state, url };
  } catch {
    return null;
  }
}

export interface PortfolioResult {
  username: string | null;
  repos: PortfolioRepo[];
  error: string | null;
}

// Fetch and normalize a user's public repositories for the portfolio.
// The configured username is resolved live (so admin/env changes apply
// immediately), while GitHub API responses are cached briefly to respect rate
// limits. The cache key includes the username, so switching accounts always
// fetches fresh.
export async function fetchPortfolioRepos(
  limit = 12,
  options?: { fresh?: boolean },
): Promise<PortfolioResult> {
  const username = await resolveGithubUsername();
  if (!username) {
    return { username: null, repos: [], error: "No GitHub username configured." };
  }

  const listCache = options?.fresh
    ? ({ cache: "no-store" } as const)
    : ({ next: { revalidate: REPO_LIST_REVALIDATE } } as const);

  let raw: RawRepo[];
  try {
    const res = await fetch(
      `${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers: ghHeaders(), ...listCache },
    );
    if (res.status === 404) {
      return {
        username,
        repos: [],
        error: `GitHub user "${username}" was not found.`,
      };
    }
    if (res.status === 403) {
      return {
        username,
        repos: [],
        error:
          "GitHub API rate limit reached. Add a GITHUB_TOKEN to raise the limit.",
      };
    }
    if (!res.ok) {
      return { username, repos: [], error: `GitHub API error (${res.status}).` };
    }
    raw = (await res.json()) as RawRepo[];
  } catch {
    return { username, repos: [], error: "Could not reach the GitHub API." };
  }

  const selected = raw
    .filter((r) => !r.fork)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    })
    .slice(0, limit);

  const repos = await Promise.all(
    selected.map(async (r): Promise<PortfolioRepo> => {
      const [languages, deployment] = await Promise.all([
        fetchLanguages(r.owner.login, r.name),
        fetchDeployment(r.owner.login, r.name),
      ]);
      return {
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage && r.homepage.trim() ? r.homepage.trim() : null,
        language: r.language,
        languages,
        topics: r.topics ?? [],
        stars: r.stargazers_count,
        forks: r.forks_count,
        watchers: r.watchers_count,
        openIssues: r.open_issues_count,
        pushedAt: r.pushed_at,
        createdAt: r.created_at,
        isArchived: r.archived,
        hasPages: r.has_pages,
        pagesUrl: pagesUrlFor(r),
        deployment,
      };
    }),
  );

  return { username, repos, error: null };
}

// Deterministic brand-ish colors for common languages (used in graphics/badges).
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Solidity: "#AA6746",
  Jupyter: "#DA5B0B",
  "Jupyter Notebook": "#DA5B0B",
};

export function languageColor(language: string | null | undefined): string {
  if (!language) return "#8b95a5";
  return LANGUAGE_COLORS[language] ?? "#8b95a5";
}
