"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { STAGE_META, type ProjectDTO } from "@/lib/types";

function CategoryIcon({ category }: { category: string }) {
  if (category === "hardware") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m8 9-3 3 3 3M16 9l3 3-3 3M13 6l-2 12" strokeLinecap="round" />
    </svg>
  );
}

export function VoteButton({
  voteCount,
  hasVoted,
  pending,
  onVote,
}: {
  voteCount: number;
  hasVoted: boolean;
  pending: boolean;
  onVote: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onVote();
      }}
      disabled={pending}
      aria-pressed={hasVoted}
      className={`group/vote flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2 transition disabled:opacity-60 ${
        hasVoted
          ? "border-teal-300/40 bg-teal-400/15 text-teal-200"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
      }`}
      title={hasVoted ? "Remove your vote" : "Vote for this project"}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-transform ${hasVoted ? "animate-pop" : "group-hover/vote:-translate-y-0.5"}`}
        fill={hasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 4 8 9h-5v7H9v-7H4z" />
      </svg>
      <span className="text-sm font-semibold tabular-nums">{voteCount}</span>
    </button>
  );
}

export function ProjectCard({
  project,
  index,
  pending,
  onVote,
  onOpen,
}: {
  project: ProjectDTO;
  index: number;
  pending: boolean;
  onVote: (id: string) => void;
  onOpen: (project: ProjectDTO) => void;
}) {
  const stage = STAGE_META[project.stage];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => onOpen(project)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl glass transition hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {project.featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow">
          ★ Featured
        </span>
      )}

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-sky-950/50 via-slate-900/40 to-teal-900/30">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-black tracking-tight text-white/10">
              {project.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/60 ring-1 ring-white/10">
            <CategoryIcon category={project.category} />
            {project.category}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${stage.classes}`}
          >
            {stage.label}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-snug text-white">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/55">
            {project.summary}
          </p>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/45"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-white/40">
            Tap card for details
          </span>
          <VoteButton
            voteCount={project.voteCount}
            hasVoted={!!project.hasVoted}
            pending={pending}
            onVote={() => onVote(project.id)}
          />
        </div>
      </div>
    </motion.article>
  );
}
