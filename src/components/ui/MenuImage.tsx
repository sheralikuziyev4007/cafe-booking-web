import { useState } from "react";
import { CATEGORY_ICONS } from "@/data/categoryIcons";
import { imageSrcSet } from "@/data/responsiveImages";
import type { Category } from "@/types";

interface MenuImageProps {
  src: string;
  alt: string;
  category: Category;
  /** Container classes (size, radius) */
  className?: string;
  /** Classes for the <img> itself (e.g. hover zoom) */
  imgClassName?: string;
  /** Rendered width hint for responsive images, e.g. "(min-width: 1024px) 360px, 100vw" */
  sizes?: string;
  iconSize?: number;
}

/** Menu item image. With no link, or if the image fails to load, a category icon placeholder is shown. */
export function MenuImage({ src, alt, category, className = "", imgClassName = "", iconSize = 32, sizes = "100vw" }: MenuImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const Icon = CATEGORY_ICONS[category];
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className={`overflow-hidden bg-line/50 flex items-center justify-center text-copy/60 ${className}`}>
      {showImage ? (
        <img
          src={src}
          srcSet={imageSrcSet(src)}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      ) : (
        <Icon size={iconSize} aria-hidden="true" />
      )}
    </div>
  );
}
