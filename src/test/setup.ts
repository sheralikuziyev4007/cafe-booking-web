import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// The forms download Zod on first submit (see schemas/lazyResolver.ts). Loading it inside a test can take seconds
// on a slow or busy machine and make that test time out, so load it before any test starts.
await Promise.all([
  import("@hookform/resolvers/zod"),
  import("@/schemas/contact"),
  import("@/schemas/booking"),
  import("@/schemas/menu"),
  import("@/schemas/login"),
]);

// jsdom has no matchMedia and scrollIntoView
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
Element.prototype.scrollIntoView = () => {};
window.scrollTo = (() => {}) as typeof window.scrollTo;

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
