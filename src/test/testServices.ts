import { createLocalServices } from "@/services";
import type { AuthService, InboxRepository, MenuRepository, Services } from "@/services";

interface Overrides {
  mode?: Services["mode"];
  menu?: Partial<MenuRepository>;
  inbox?: Partial<InboxRepository>;
  auth?: Partial<AuthService>;
}

/** The demo services with some methods replaced, e.g. to make a request slow or failing */
export function createTestServices({ mode = "local", menu, inbox, auth }: Overrides = {}): Services {
  const local = createLocalServices();
  return {
    mode,
    menu: { ...local.menu, ...menu },
    inbox: { ...local.inbox, ...inbox },
    auth: { ...local.auth, ...auth },
  };
}

/** A promise that is resolved or rejected from the test, to freeze a request in the "loading" state */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
