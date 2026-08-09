import type { Env } from "./env";

export { Presence } from "./presence";

/**
 * Static assets win by default: anything matching a file in `out/` is served
 * by the runtime and never reaches this code. The one carve-out is /api/*,
 * routed here first by `run_worker_first` in wrangler.jsonc — so in practice
 * this handler sees the socket endpoint and little else.
 */
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/presence") {
      // One id for everyone, so the count is one number and not one per
      // colo. The hint only applies the first time it is created; the crowd
      // is in India, so put the ground there rather than wherever the first
      // request happened to land.
      const id = env.PRESENCE.idFromName("global");
      return env.PRESENCE.get(id, { locationHint: "apac" }).fetch(request);
    }

    // Unmatched path — hand back to assets so the exported 404 page renders.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
