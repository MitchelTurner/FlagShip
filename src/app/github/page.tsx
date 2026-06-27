import Link from "next/link";
import type { Metadata } from "next";
import { fetchPortfolioRepos } from "@/lib/github";
import { resolveGithubUsernameWithSource } from "@/lib/settings";
import { RepoCard } from "@/components/RepoCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live work — Fathomline",
  description: "An auto-generated portfolio sourced from my public GitHub work.",
};

const SOURCE_HINT = {
  database: "admin dashboard",
  env: "GITHUB_USERNAME environment variable",
  config: "github.config.json",
} as const;

export default async function GithubPage({
  searchParams,
}: {
  searchParams: Promise<{ fresh?: string }>;
}) {
  const params = await searchParams;
  const fresh = params.fresh === "1";
  const resolved = await resolveGithubUsernameWithSource();
  const { username, repos, error } = await fetchPortfolioRepos(24, { fresh });

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const deployed = repos.filter(
    (r) => r.homepage || r.pagesUrl || r.deployment,
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
          </svg>
          Auto-synced from GitHub
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Live <span className="text-gradient">work</span>
        </h1>
        <p className="mt-2 max-w-2xl text-white/55">
          This portfolio builds itself from{" "}
          {username ? (
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
            >
              @{username}
            </a>
          ) : (
            "your"
          )}{" "}
          public repositories — complete with generated cover art, language
          breakdowns and live deployment links.
        </p>

        {username && resolved.source && (
          <p className="mt-3 text-xs text-white/40">
            Syncing via {SOURCE_HINT[resolved.source]}
            {fresh ? " · just refreshed" : " · auto-refreshes every ~2 minutes"}
          </p>
        )}

        {repos.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: "repositories", value: repos.length },
              { label: "total stars", value: totalStars },
              { label: "with deployments", value: deployed },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl px-4 py-2">
                <span className="text-lg font-bold text-white">{s.value}</span>{" "}
                <span className="text-sm text-white/50">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-lg font-medium text-white/80">
            {username ? "Couldn't load repositories" : "No GitHub account linked yet"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">{error}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin"
              className="inline-flex rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Configure in admin
            </Link>
            {username && (
              <Link
                href="/github?fresh=1"
                className="inline-flex rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
              >
                Try again
              </Link>
            )}
          </div>
        </div>
      ) : repos.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-lg font-medium text-white/80">No public repositories found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            @{username} has no public, non-fork repositories to display.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
