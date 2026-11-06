import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";
import App from "@/App";
import { createQueryClient } from "@/lib/queryClient";
import type { Services } from "@/services";
import type { Lang } from "@/types";

interface RenderOptions {
  /** Replaces the data layer (see testServices.ts) */
  services?: Services;
  queryClient?: QueryClient;
}

/** Renders the whole app at `path` with a fixed language. Failed requests are not retried, so error states appear at once. */
export function renderApp(path = "/", lang: Lang = "en", { services, queryClient }: RenderOptions = {}) {
  const user = userEvent.setup();
  const client = queryClient ?? createQueryClient({ retry: false });
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App initialLang={lang} services={services} queryClient={client} />
    </MemoryRouter>
  );
  return { user, queryClient: client, ...utils };
}
