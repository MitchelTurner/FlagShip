import Link from "next/link";
import { ProjectGallery } from "@/components/ProjectGallery";

export default function Home() {
  return (
    <>
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-10 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
            </span>
            Charting hardware &amp; software · live
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Sound the depths.
            <br />
            <span className="text-gradient">You decide what surfaces.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            A living portfolio of concepts — finished products, working
            prototypes, and bold mockups charted at every depth. Explore the
            soundings and vote for the ideas you want brought to the surface.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#showcase"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
            >
              Dive into the showcase
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              Upload a project
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Concepts", value: "Hardware + Software" },
            { label: "Soundings", value: "Idea → Surfaced" },
            { label: "Crew", value: "1 vote = 1 voice" },
            { label: "Charts updated", value: "Continuously" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-sm font-semibold text-white">
                {item.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wide text-white/40">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProjectGallery />
    </>
  );
}
