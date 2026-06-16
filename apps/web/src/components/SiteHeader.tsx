import { nav, site } from "@/lib/site";
import { Wordmark } from "./Wordmark";
import { IconGitHub } from "./icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <a href="#top" className="flex items-center text-ink" aria-label="Differ — home">
          <Wordmark className="h-7 w-auto sm:h-8" />
        </a>

        <nav className="ml-auto hidden items-center gap-7 text-sm text-muted md:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {site.githubUrl && (
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <IconGitHub className="size-5" />
            </a>
          )}
          <a
            href={site.download.href}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-canvas shadow-sm transition-opacity hover:opacity-90"
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
