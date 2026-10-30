import { forwardRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { imageSrcSet } from "@/data/responsiveImages";

export const About = forwardRef<HTMLElement>(function About(_props, ref) {
  const { t } = useI18n();

  return (
    <section ref={ref} className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
      <Reveal>
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} className="mb-6" />
        <p className="mb-4 leading-relaxed text-copy font-body">{t.about.p1}</p>
        <p className="leading-relaxed text-copy font-body">{t.about.p2}</p>
      </Reveal>
      <Reveal delay={150} className="grid grid-cols-2 gap-4">
        <img
          src="/images/interior.webp"
          srcSet={imageSrcSet("/images/interior.webp")}
          sizes="(min-width: 1152px) 270px, (min-width: 768px) 23vw, 45vw"
          alt={t.about.imgInterior}
          loading="lazy"
          width={800}
          height={1067}
          className="aspect-square rounded-sm object-cover w-full h-auto bg-line/50 shadow-lg"
        />
        <img
          src="/images/latte-art.webp"
          srcSet={imageSrcSet("/images/latte-art.webp")}
          sizes="(min-width: 1152px) 270px, (min-width: 768px) 23vw, 45vw"
          alt={t.about.imgLatte}
          loading="lazy"
          width={800}
          height={449}
          className="aspect-square rounded-sm object-cover w-full h-auto mt-8 bg-line/50 shadow-lg"
        />
      </Reveal>
    </section>
  );
});
