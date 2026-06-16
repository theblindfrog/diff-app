import { AppShot } from "./AppShot";

export function Showcase() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Native UI</p>
        <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Clean, native, and out of your way.
        </h2>
        <p className="mt-4 text-pretty text-lg text-muted">
          Differ follows your macOS appearance — light or dark — with a focused interface built on
          Tauri, not Electron. Drop in two files, or switch to Paste mode for two editable panes.
        </p>
      </div>

      {/* Dark spotlight panel so the light app window has strong contrast in either site theme. */}
      <div className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-[#30363d] bg-gradient-to-b from-[#1b2330] to-[#0d1117] p-5 shadow-xl shadow-black/20 sm:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(36rem 22rem at 30% 0%, rgba(47,129,247,0.22), transparent 70%), radial-gradient(30rem 20rem at 85% 100%, rgba(63,185,80,0.16), transparent 70%)",
          }}
        />
        <AppShot
          src="/screenshots/paste-light.png"
          alt="The Differ window in light mode showing the Original and Modified panes ready for input"
          sizes="(min-width: 1024px) 52rem, 100vw"
          className="relative"
        />
      </div>
    </section>
  );
}
