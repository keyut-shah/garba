# ગરબા — Garba Night

The society garba ground, in your browser. Nine nights, nine colours.

Inspired by [saloon.wtf](https://saloon.wtf) by [@ybhrdwj](https://twitter.com/ybhrdwj).

## How it works

- **No backend.** `next build` produces a fully static site (`out/`). Nothing to
  scale, nothing to pause under load.
- **Audio is a hidden YouTube iframe.** The visible player is custom UI proxying
  to the IFrame API; the player itself is a 1px, zero-opacity div.
- **The scene is SVG, not an image.** `components/GarbaGround.tsx` draws the
  mandap, string lights and ~92 dancers from code, so re-grading it to another
  night's colour is free and weighs nothing. Layout uses a seeded PRNG —
  never `Math.random()`, or server and client render different crowds and
  React throws a hydration error.
- **The night arc.** `lib/tracks.ts` tags each track with a phase and picks a
  starting point from the current hour in IST: aarti at 8pm, the Falguni hour
  around 10, non-stop past midnight.

## Adding a track

Every `videoId` in `lib/tracks.ts` was verified to be **both** playable and
embeddable. An unembeddable video is a silently dead player, so check before
adding:

```bash
node -e "fetch('https://www.youtube.com/watch?v=VIDEO_ID',{headers:{'user-agent':'Mozilla/5.0'}}).then(r=>r.text()).then(h=>console.log(/\"playableInEmbed\":true/.test(h)?'OK embeddable':'NOT EMBEDDABLE'))"
```

## Before deploying

Set the real origin, or link previews break everywhere:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

`public/_headers` forces `Content-Type: image/png` on `/opengraph-image`, which
the static export writes without a file extension. Don't delete it.

## Known gaps

- The dancer count in `components/Experience.tsx` is **simulated**, not measured.
  It is marked `PLACEHOLDER`. Wire it to a real store before calling it live.
- No crossfade between tracks yet (~1s gap).
- One generic murti; the nine distinct goddess forms are not done.

## Commands

```bash
npm run dev     # localhost:3000
npm run build   # static export to out/
```
