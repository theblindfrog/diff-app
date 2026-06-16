import { nav, site } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { IconGitHub } from "./icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-elevated/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Wordmark className="h-5 w-auto text-ink" />
            <p className="mt-4 text-sm leading-relaxed text-muted">{site.tagline}</p>
          </div>

          <nav className="flex flex-col gap-3 text-sm">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            {site.githubUrl && (
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-ink"
              >
                <IconGitHub className="size-4" />
                GitHub
              </a>
            )}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©&nbsp;2026{" "}
            <a
              href="https://alexanderpowell.me"
              target="_blank"
              rel="noreferrer"
              className="text-muted underline decoration-line underline-offset-2 transition-colors hover:text-ink"
            >
              Alex Powell
            </a>{" "}
            · All rights reserved.
          </p>
          <p>
            Built with Tauri &amp; Next.js · Diffs by{" "}
            <a
              href={site.diffEngine.href}
              target="_blank"
              rel="noreferrer"
              className="text-muted underline decoration-line underline-offset-2 transition-colors hover:text-ink"
            >
              {site.diffEngine.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
