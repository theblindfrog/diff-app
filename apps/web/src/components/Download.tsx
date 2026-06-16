import { site } from "@/lib/site";
import { IconApple, IconCheck } from "./icons";

const HIGHLIGHTS = ["Free for personal use", "Apple Silicon native", "No account, no telemetry"];

export function Download() {
  const { available, href, version, requirements } = site.download;

  return (
    <section id="download" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 hero-glow" aria-hidden="true" />
        {/* Diff-motif corner marks */}
        <span
          className="pointer-events-none absolute left-8 top-8 font-mono text-5xl font-bold text-brand-plus/30 select-none"
          aria-hidden="true"
        >
          +
        </span>
        <span
          className="pointer-events-none absolute bottom-8 right-10 font-mono text-5xl font-bold text-brand-minus/30 select-none"
          aria-hidden="true"
        >
          −
        </span>

        <div className="relative mx-auto max-w-xl">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Download</p>
          <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Get {site.name} for macOS
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted">
            A focused, native diff tool that stays out of your way.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            {available ? (
              <a
                href={href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-7 py-4 text-base font-semibold text-canvas shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <IconApple className="size-5" />
                Download for macOS
              </a>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span
                  aria-disabled="true"
                  className="inline-flex cursor-default items-center justify-center gap-2 rounded-xl bg-ink px-7 py-4 text-base font-semibold text-canvas opacity-70 shadow-lg shadow-black/10"
                >
                  <IconApple className="size-5" />
                  Download for macOS
                  <span className="ml-1 rounded-full bg-canvas/20 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide">
                    Soon
                  </span>
                </span>
                <p className="font-mono text-xs text-muted">
                  v{version} · early access — a notarized public build is on the way.
                </p>
              </div>
            )}
            <p className="mt-1 font-mono text-xs text-muted">{requirements}</p>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="inline-flex items-center gap-2">
                <IconCheck className="size-4 text-add" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
