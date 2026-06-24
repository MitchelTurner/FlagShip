"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useVoterKey } from "@/lib/voter";
import {
  CATEGORIES,
  STAGES,
  type Category,
  type ProjectDTO,
  type Stage,
} from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";

type SortKey = "top" | "new";

export function ProjectGallery() {
  const voterKey = useVoterKey();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("top");
  const [category, setCategory] = useState<Category | "all">("all");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [active, setActive] = useState<ProjectDTO | null>(null);

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams({ sort });
    if (category !== "all") params.set("category", category);
    if (stage !== "all") params.set("stage", stage);
    if (voterKey) params.set("voterKey", voterKey);
    const res = await fetch(`/api/projects?${params.toString()}`, {
      cache: "no-store",
    });
    const data = await res.json();
    setProjects(data.projects ?? []);
    setLoading(false);
  }, [sort, category, stage, voterKey]);

  useEffect(() => {
    // fetchProjects only updates state after an awaited fetch, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  const handleVote = useCallback(
    async (id: string) => {
      if (!voterKey || pendingId) return;
      setPendingId(id);
      try {
        const res = await fetch(`/api/projects/${id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voterKey }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const update = (p: ProjectDTO) =>
          p.id === id
            ? { ...p, voteCount: data.voteCount, hasVoted: data.hasVoted }
            : p;
        setProjects((prev) => prev.map(update));
        setActive((prev) => (prev && prev.id === id ? update(prev) : prev));
      } finally {
        setPendingId(null);
      }
    },
    [voterKey, pendingId],
  );

  const totalVotes = useMemo(
    () => projects.reduce((sum, p) => sum + p.voteCount, 0),
    [projects],
  );

  return (
    <section id="showcase" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The <span className="text-gradient">Showcase</span>
          </h2>
          <p className="mt-2 max-w-xl text-white/55">
            Every concept — from finished builds to early mockups. Vote for the
            ones you want to see become real.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-white/50">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div>projects</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalVotes}</div>
            <div>votes cast</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass mb-8 flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ideas, tags…"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder-white/35 outline-none transition focus:border-cyan-400/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={category}
            onChange={(v) => setCategory(v as Category | "all")}
            options={[
              { value: "all", label: "All" },
              ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
            ]}
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage | "all")}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 outline-none transition focus:border-cyan-400/50"
          >
            <option value="all">All stages</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Segmented
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              { value: "top", label: "Top voted" },
              { value: "new", label: "Newest" },
            ]}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl border border-white/5 bg-white/5"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl py-20 text-center">
          <p className="text-lg font-medium text-white/70">No projects yet</p>
          <p className="mt-1 text-sm text-white/45">
            Try clearing filters, or head to the admin area to add the first
            idea.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                pending={pendingId === project.id}
                onVote={handleVote}
                onOpen={setActive}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ProjectModal
        project={active}
        pending={pendingId === active?.id}
        onVote={handleVote}
        onClose={() => setActive(null)}
      />
    </section>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === opt.value
              ? "bg-white/15 text-white"
              : "text-white/55 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
