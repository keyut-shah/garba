import type { Presence } from "./presence";

export interface Env {
  /** The static export in `out/`, served by the runtime. */
  ASSETS: Fetcher;
  /** One instance, named "global" — see worker/index.ts. */
  PRESENCE: DurableObjectNamespace<Presence>;
}
