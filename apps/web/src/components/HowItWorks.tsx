import { AppShot } from "./AppShot";

const STEPS = [
  {
    n: "01",
    title: "Pick two files, or paste text",
    body: "Drag and drop two files, choose them from the picker, or type straight into the two editable panes.",
  },
  {
    n: "02",
    title: "Differ shows every change",
    body: "Word-level diffs with GitHub-quality syntax highlighting, side-by-side or unified — your choice.",
  },
  {
    n: "03",
    title: "Stay in flow",
    body: "Save in your editor and the diff updates live. Step through changes with the keyboard. Your setup is remembered next time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-line bg-elevated/40">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">How it works</p>
          <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            From two files to a clear diff in seconds.
          </h2>

          <ol className="mt-10 space-y-8">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-5">
                <span className="font-mono text-sm font-semibold text-accent">{s.n}</span>
                <div className="border-l border-line pl-5">
                  <h3 className="font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-6 hero-glow opacity-70"
            aria-hidden="true"
          />
          <AppShot
            src="/screenshots/languages-dark.png"
            alt="Differ's language picker open, listing the supported syntax-highlighting languages"
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="relative"
          />
        </div>
      </div>
    </section>
  );
}
