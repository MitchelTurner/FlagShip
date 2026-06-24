"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { STAGE_META, type ProjectDTO } from "@/lib/types";
import { VoteButton } from "./ProjectCard";

export function ProjectModal({
  project,
  pending,
  onVote,
  onClose,
}: {
  project: ProjectDTO | null;
  pending: boolean;
  onVote: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (project) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="glass-strong relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/70 backdrop-blur transition hover:bg-black/60 hover:text-white"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-sky-950/50 to-teal-900/40">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-7xl font-black text-white/10">
                    {project.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-transparent to-transparent" />
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/60 ring-1 ring-white/10">
                  {project.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${STAGE_META[project.stage].classes}`}
                >
                  {STAGE_META[project.stage].label}
                </span>
                {project.featured && (
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-semibold text-black">
                    ★ Featured
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {project.title}
                </h2>
                <p className="mt-1 text-white/60">{project.summary}</p>
              </div>

              <p className="whitespace-pre-wrap leading-relaxed text-white/75">
                {project.description}
              </p>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/55"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="flex items-center gap-3">
                  <VoteButton
                    voteCount={project.voteCount}
                    hasVoted={!!project.hasVoted}
                    pending={pending}
                    onVote={() => onVote(project.id)}
                  />
                  <span className="text-sm text-white/50">
                    {project.hasVoted
                      ? "Thanks for voting!"
                      : "Vote to surface this from the depths"}
                  </span>
                </div>

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    View demo
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
