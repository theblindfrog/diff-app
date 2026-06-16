import Image from "next/image";

/**
 * A real Differ app screenshot. The PNGs are macOS window captures with
 * transparent margins and a baked-in window shadow (1312×912), so they float
 * cleanly on either theme — no border or clipping (which would crop the shadow).
 */
export function AppShot({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1312}
      height={912}
      priority={priority}
      sizes={sizes}
      className={`h-auto w-full drop-shadow-2xl ${className}`}
    />
  );
}
