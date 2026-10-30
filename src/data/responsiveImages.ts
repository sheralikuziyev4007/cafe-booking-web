/**
 * Smaller copies of the local photos (public/images/<name>-w400.webp, -w800.webp) so phones
 * don't download full-size files. `width` is the width of the original file.
 * Images added via the admin panel by URL are used as they are.
 */
const RESPONSIVE_IMAGES: Record<string, { width: number; variants: number[] }> = {
  "avocado-toast": { width: 685, variants: [400] },
  cappuccino: { width: 567, variants: [400] },
  cheesecake: { width: 547, variants: [400] },
  "flat-white": { width: 1024, variants: [400, 800] },
  interior: { width: 800, variants: [400] },
  "latte-art": { width: 800, variants: [400] },
  oatmeal: { width: 554, variants: [400] },
  pasta: { width: 1200, variants: [400, 800] },
  raf: { width: 1536, variants: [400, 800] },
};

/** srcSet for a local /images/<name>.webp file, or undefined if there are no smaller copies */
export function imageSrcSet(src: string): string | undefined {
  const match = /^\/images\/([\w-]+)\.webp$/.exec(src);
  const entry = match && RESPONSIVE_IMAGES[match[1]];
  if (!match || !entry) return undefined;
  return [...entry.variants.map((w) => `/images/${match[1]}-w${w}.webp ${w}w`), `${src} ${entry.width}w`].join(", ");
}
