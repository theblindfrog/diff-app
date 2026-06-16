/**
 * Minimal inline icon set (stroke-based, 24×24, currentColor).
 * Avoids pulling in an icon dependency for a handful of glyphs.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Live file-watching */
export const IconLive = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

/** Paste mode */
export const IconPaste = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="4" width="8" height="4" rx="1" />
    <path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" />
    <path d="M9 13h6M9 17h4" />
  </Base>
);

/** Split / unified layout */
export const IconColumns = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16" />
  </Base>
);

/** Word-level diff (target within a line) */
export const IconWord = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h7M4 12h4M4 17h6" />
    <circle cx="16.5" cy="14.5" r="3.5" />
    <path d="m21 19-2-2" />
  </Base>
);

/** Syntax highlighting */
export const IconCode = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />
  </Base>
);

/** Change navigation */
export const IconNavigate = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5" />
  </Base>
);

/** Native / fast */
export const IconBolt = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </Base>
);

/** Theme + persistence */
export const IconTheme = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="m20 6-11 11-5-5" />
  </Base>
);

export const IconApple = (p: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...p}
  >
    <path d="M16.37 12.78c.03 2.93 2.58 3.9 2.6 3.92-.02.07-.4 1.4-1.34 2.77-.8 1.18-1.65 2.36-2.97 2.38-1.3.02-1.72-.77-3.2-.77-1.49 0-1.95.75-3.18.79-1.28.05-2.25-1.28-3.06-2.46-1.66-2.4-2.92-6.79-1.22-9.75.84-1.47 2.35-2.4 3.99-2.43 1.25-.02 2.43.84 3.2.84.76 0 2.2-1.04 3.7-.89.63.03 2.4.26 3.54 1.92-.09.06-2.11 1.24-2.06 3.71M14.2 4.86c.68-.83 1.14-1.98.99-3.13-.96.04-2.12.64-2.82 1.46-.63.73-1.18 1.9-1.03 3.02 1.07.08 2.17-.54 2.86-1.35" />
  </svg>
);

export const IconGitHub = (p: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...p}
  >
    <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.78c-2.92.63-3.54-1.4-3.54-1.4-.48-1.22-1.17-1.55-1.17-1.55-.95-.65.08-.64.08-.64 1.05.07 1.6 1.08 1.6 1.08.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.18 0-1.15.41-2.08 1.08-2.82-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.88 1.07a9.98 9.98 0 0 1 5.24 0c2-1.35 2.88-1.07 2.88-1.07.57 1.45.21 2.52.1 2.79.67.74 1.07 1.67 1.07 2.82 0 4.02-2.45 4.9-4.79 5.16.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
  </svg>
);
