import { forwardRef } from "react";
import { Quote, Star } from "lucide-react";
import { REVIEWS } from "@/data/seedData";
import { useI18n } from "@/hooks/useI18n";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export const Reviews = forwardRef<HTMLElement>(function Reviews(_props, ref) {
  const { t, pick } = useI18n();

  return (
    <section ref={ref} className="max-w-6xl mx-auto px-6 py-20 md:py-24">
      <Reveal>
        <SectionHeading eyebrow={t.reviews.eyebrow} title={t.reviews.title} />
      </Reveal>

      <div className="grid md:grid-cols-3 gap-6">
        {REVIEWS.map((review, index) => (
          <Reveal key={review.id} delay={index * 120} className="h-full">
            <figure className="relative h-full p-6 rounded-md bg-pageAlt border border-line/60">
              <Quote size={28} className="absolute top-5 right-5 text-brass/30" aria-hidden="true" />
              <div className="flex gap-1 mb-3" role="img" aria-label={t.reviews.rating(review.rating)}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "#C9932E" : "none"} className="text-brass" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed mb-4 text-copy font-body">{pick(review.text)}</blockquote>
              <figcaption className="text-sm italic text-heading font-display">{pick(review.authorName)}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
});
