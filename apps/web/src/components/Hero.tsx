import { site } from "@/lib/site";
import { AppShot } from "./AppShot";
import { IconApple, IconArrowRight } from "./icons";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hero-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="reveal mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 font-mono text-xs tracking-wide text-muted"
            style={{ animationDelay: "0ms" }}
          >
            <span className="size-1.5 rounded-full bg-add" />
            NATIVE&nbsp;·&nbsp;macOS&nbsp;·&nbsp;CODE&nbsp;&amp;&nbsp;TEXT
          </p>

          <h1
            className="reveal text-balance font-display text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl"
            style={{ animationDelay: "70ms" }}
          >
            See every change, the instant you make it.
          </h1>

          <p
            className="reveal mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted"
            style={{ animationDelay: "140ms" }}
          >
            {site.name} is a fast, native macOS app for comparing two files or two blocks of text.
            Open files and it watches them live — re-diffing the moment you save. Paste snippets and
            it diffs as you type.
          </p>

          <div
            className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "210ms" }}
          >
            <a
              href={site.download.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-canvas shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <IconApple className="size-4" />
              Download for macOS
            </a>
            <a
              href="#features"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-elevated"
            >
              Explore features
              <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <p
            className="reveal mt-5 font-mono text-xs text-muted"
            style={{ animationDelay: "280ms" }}
          >
            Free · {site.download.requirements}
          </p>
        </div>

        {/* Product visual — real Differ window */}
        <div
          className="reveal relative mx-auto mt-16 max-w-4xl"
          style={{ animationDelay: "360ms" }}
        >
          <AppShot
            src="/screenshots/diff-dark.png"
            alt="Differ comparing two TypeScript files in a split, syntax-highlighted diff"
            priority
            sizes="(min-width: 1024px) 56rem, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
