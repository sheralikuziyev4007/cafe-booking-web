import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import type { Lang } from "@/types";

/** Renders the whole app at `path` with a fixed language */
export function renderApp(path = "/", lang: Lang = "en") {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App initialLang={lang} />
    </MemoryRouter>
  );
  return { user, ...utils };
}
