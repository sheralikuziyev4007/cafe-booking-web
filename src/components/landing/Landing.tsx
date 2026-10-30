import { useRef, useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { About } from "./About";
import { MenuSection } from "./MenuSection";
import { Reviews } from "./Reviews";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { BookingModal } from "./BookingModal";
import type { SectionKey } from "@/data/navigation";

export function Landing() {
  const aboutRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const reviewsRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const sectionRefs: Record<Exclude<SectionKey, "home">, React.RefObject<HTMLElement>> = {
    about: aboutRef,
    menu: menuRef,
    reviews: reviewsRef,
    contact: contactRef,
  };

  const handleNavigate = (key: SectionKey) => {
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (key === "home") {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    // The header is sticky, so the offset is handled with scroll-margin (see index.css)
    sectionRefs[key].current?.scrollIntoView({ behavior, block: "start" });
  };

  const openBooking = () => setBookingOpen(true);

  return (
    <div>
      <Header onNavigate={handleNavigate} onBook={openBooking} />
      <main>
        <Hero onNavigate={handleNavigate} onBook={openBooking} />
        <About ref={aboutRef} />
        <MenuSection ref={menuRef} />
        <Reviews ref={reviewsRef} />
        <Contact ref={contactRef} />
      </main>
      <Footer onNavigate={handleNavigate} />
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
    </div>
  );
}
