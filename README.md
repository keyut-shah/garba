# ગરબા — Garba Night

The society garba ground, in your browser. Nine nights, nine colours.

Inspired by [saloon.wtf](https://saloon.wtf) by [@ybhrdwj](https://twitter.com/ybhrdwj).

## How it works

- **Almost no backend.** `next build` produces a fully static site (`out/`),
  uploaded as a Cloudflare Worker's static assets. The only dynamic thing on
  the site is the head count.
- **The count is real.** `worker/presence.ts` is a Durable Object; every person
  on the ground holds an open WebSocket to it and the number is simply how many
  are open. Nothing is persisted — the connections *are* the state. Sockets use
  the hibernation API, so a quiet afternoon evicts the object from memory
  without dropping anyone. There is no gate to pass, so being on the page is
  what counts.
- **No enter gate.** The ground is there on load. The gate only ever existed
  because browsers refuse to start audio without a user gesture, so instead the
  attempt is made on load and, if refused, again on the first gesture anywhere
  — any tap doubles as the tap that starts the music. Don't reintroduce a
  blocking overlay to "fix" silent autoplay; that is what this replaced.
- **Audio is a hidden YouTube iframe.** The visible player is custom UI proxying
  to the IFrame API; the player itself is a 1px, zero-opacity div.
- **The scene is SVG, not an image.** `components/GarbaGround.tsx` draws the
  mandap, string lights and ~92 dancers from code, so re-grading it to another
  night's colour is free and weighs nothing. A photographic background was
  considered and rejected: a JPEG cannot re-grade from orange to peacock green,
  and the nine-colour system is the whole point.
- **The backdrop is the music.** `components/CoverBackdrop.tsx` takes the
  current track's YouTube thumbnail, blurs it to 90px and tints it toward the
  night's colour, so the sky changes with every song. Hotlinked at `hqdefault`
  — it exists for every video (`maxresdefault` does not, and a miss returns a
  grey placeholder), and resolution is irrelevant under that much blur.
- **Two hydration hazards, not one.** The seeded PRNG covers `Math.random()`.
  The subtler one is `Math.sin`/`Math.cos`: IEEE 754 does not require them to
  be correctly rounded, so Node's prerender and the browser's hydration can
  disagree in the final bit. Everything derived from trig goes through `q()` in
  `GarbaGround.tsx` before it reaches the DOM — including the animation delays,
  and including the values the painter's-algorithm sort compares.
- **The night arc.** `lib/tracks.ts` tags each track with a phase and picks a
  starting point from the current hour in IST: taali garba from 8pm, the
  Falguni hour around 10, non-stop past midnight.

## Adding a track

Every `videoId` in `lib/tracks.ts` was verified to be **both** playable and
embeddable. An unembeddable video is a silently dead player, so check before
adding:

```bash
node -e "fetch('https://www.youtube.com/watch?v=VIDEO_ID',{headers:{'user-agent':'Mozilla/5.0'}}).then(r=>r.text()).then(h=>console.log(/\"playableInEmbed\":true/.test(h)?'OK embeddable':'NOT EMBEDDABLE'))"
```

## Before deploying

**Wrangler needs Node 22+.** It will refuse to start on anything older.

Set the real origin, or link previews break everywhere:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Optional: total-visits tracking, separate from the live head count (which is
only ever "right now"). dash.cloudflare.com → Analytics & Logs → Web
Analytics → Add a site → the **manual JS snippet** option — a workers.dev
subdomain isn't a zone Cloudflare manages DNS for, so the automatic-setup
dropdown won't find it. No cookies, nothing to consent to, free on every plan.

```bash
NEXT_PUBLIC_CF_BEACON_TOKEN=your-token-here
```

`public/_headers` forces `Content-Type: image/png` on `/opengraph-image`, which
the static export writes without a file extension. Don't delete it. Note those
rules apply to **assets only** — never to Worker responses.

`run_worker_first: ["/api/*"]` in `wrangler.jsonc` is load-bearing. Assets are
matched before the Worker runs, and without that carve-out it is up to routing
precedence whether `/api/presence` reaches the Worker or gets swallowed as a
404. Everything else stays asset-first and costs no invocation.

## Known gaps

- **~167 CSS animations run at once** (92 swaying dancers, 69 flickering bulbs,
  the drifting bokeh group, the light shafts). All opacity/transform only, and
  all disabled under `prefers-reduced-motion`, but it is untested on a low-end
  phone. If it stutters, the dancers are the ones to cut.
- **Redeploying does not update a live Durable Object.** A running instance
  keeps its old code until it shuts down, so a fix can look like it failed if
  you reconnect immediately. Wait it out before concluding anything.
- **One Durable Object holds everyone**, so the count is global but so is the
  ceiling — a single object has a soft limit of ~1,000 req/s, and every join or
  leave fans out a message to all open sockets. Fine for a society ground;
  shard into N objects behind an aggregator if it ever gets famous.
- **The count now includes people who never started the music**, since loading
  the page opens the socket. It reads "dancing", which is a slight stretch for
  a forgotten background tab.
- Night dots are 32x44 hit areas with a 9-15px visible dot; swipe (and arrow
  keys) change nights. `lib/useSwipe.ts` ignores anything inside
  `[data-no-swipe]` — the player card carries that marker because the seek bar
  is a plain div, and scrubbing would otherwise swipe the night away.
- No crossfade between tracks yet (~1s gap).
- One generic murti; the nine distinct goddess forms are not done.

## Commands

```bash
npm run dev       # localhost:3000 — no Worker, so the count reads "—"
npm run preview   # build + wrangler dev — the real thing, count included
npm run deploy    # build + wrangler deploy
npm run typecheck # app and worker are separate TS projects
```

`next dev` serves no Worker, so `/api/presence` 404s and the number stays a dash.
Use `npm run preview` to see it move — open two tabs and watch it count.
