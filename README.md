# Delay Resonance Explorer

An educational audio tool that visualises how very short delay times create comb-filter
resonances. Adjust delay time, feedback, dry/wet mix and stereo settings, then immediately see the
frequency-response curve and hear the effect through the Web Audio API. The app includes built-in
presets, a collapsible explanation panel, and a Supabase-backed private preset library with rendered
audio snapshots.

## Features

- Large 1–50 ms delay slider with live resonance spacing and first-five-peaks readouts
- Feedforward and feedback comb-filter visualisation on a canvas graph (0–3000 Hz, dB scale)
- Hover inspection with frequency, gain per channel and nearest resonance peak
- Mono and stereo delay chains with independent left/right delays
- Web Audio test signals: sine, sawtooth, white noise and percussive impulse
- Real feedback loop with a limiter, conservative master gain and smooth parameter automation
- Built-in presets: Metallic Ring, Harmonic Resonance, Deep Resonance, Short Echo and
  Ableton-inspired Stereo
- Supabase email/password auth, owner-only preset CRUD and private WAV snapshot storage
- Responsive dark audio-plugin interface with cyan/amber channel colours

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Web Audio API + OfflineAudioContext
- Supabase (Auth, Postgres, Storage)
- Vitest for DSP and WAV tests

## Getting started

Requirements: Node 20+ and npm.

```bash
npm install
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

The explorer at `/` works without Supabase. Saving presets requires a configured project and a
logged-in user.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the project URL and the **anon/public** key into `.env.local`.
3. Open the **SQL Editor** and run everything in
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates:
   - `presets` and `audio_renders` tables
   - owner-only Row Level Security policies
   - the `updated_at` trigger and a unique one-snapshot-per-preset index
   - the private `preset-audio` storage bucket and folder-scoped policies
4. In **Authentication → Providers**, make sure Email is enabled.
5. For quick local testing, turn **Confirm email** off under Authentication → Email. Otherwise a new
   account must confirm its email before it can log in.
6. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:5173` and add
   your production URL later.

Never expose the `service_role` key in the frontend. The app only uses the anon key, and RLS
restricts every row and storage object to its owner.

## Scripts

| Command             | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the Vite dev server                |
| `npm run build`     | Type-check and build for production      |
| `npm run typecheck` | Run TypeScript without emitting          |
| `npm run lint`      | Run Oxlint                               |
| `npm test`          | Run the Vitest suite once                |
| `npm run test:watch`| Run tests in watch mode                  |
| `npm run preview`   | Preview the production build             |

## Routes

| Route           | Access        | Purpose                                                     |
| --------------- | ------------- | ----------------------------------------------------------- |
| `/`             | Public        | Main explorer; audio starts on a user gesture                |
| `/login`        | Public        | Email/password login                                         |
| `/register`     | Public        | Email/password registration                                  |
| `/presets`      | Authenticated | Private preset library loaded from Supabase                  |
| `/presets/:id`  | Authenticated | Saved parameters, response graph, snapshot playback, actions |

Guests can experiment freely. Pressing Save stores the current settings as a session draft, asks
the visitor to log in, then restores the settings and opens the save dialog.

## DSP notes

Feedforward comb filter:

```text
H(f) = 1 + g · e^(−j2πfT)
|H(f)| = √(1 + g² + 2g·cos(2πfT))
```

Feedback comb filter:

```text
H(f) = 1 / (1 − g · e^(−j2πfT))
|H(f)| = 1 / √(1 + g² − 2g·cos(2πfT))
```

Resonance spacing is `f = 1000 / delayMs`; peaks occur at `k / T`. Feedback is capped at 98%, and
the graph uses a +36 dB ceiling and −40 dB floor. The graph is the theoretical filter response; the
live audio also depends on dry/wet, source signal and the safety limiter. Changing delay time inside
a feedback loop produces pitch artefacts, which is expected delay behaviour.

## Audio snapshots

The detail page can render 8 seconds of the saved preset with `OfflineAudioContext` at 44.1 kHz
stereo, encode it as 16-bit PCM WAV (about 2.8 MB), upload it to
`preset-audio/<user_id>/<preset_id>.wav`, and play it back through a one-hour signed URL. Preset
deletion removes the stored WAV before deleting the database row.

## Deployment

The app is a standard Vite SPA. Deploy to Vercel or Netlify:

- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the deployment environment
- Add the deployed URL to Supabase Authentication → URL Configuration

`vercel.json` and `public/_redirects` are included so client-side routes work on refresh.

## Project structure

```text
src/
  components/     UI, graph, presets, education and layout components
  lib/audio/      response math, parameter clamping, live graph, sources, engine, offline render, WAV
  lib/auth/       Supabase auth context and protected-route helper
  lib/            Supabase client, preset API, formatting and preset data
  pages/          Explore, Presets, PresetDetail, Login, Register, NotFound
  types/          Shared TypeScript types
supabase/
  migrations/0001_init.sql
```

## Testing

The Vitest suite covers the filter math (10 ms → 100 Hz spacing, 3 ms → 333.33 Hz, peak/null gains,
display clamping), parameter sanitising and the WAV encoder. Manual QA should also cover audio
start/stop, stereo mode, auth, owner-only RLS and snapshot playback.

## Submission notes

- The original product spec and assignment plan are in
  [`delay_resonance_explorer.md`](delay_resonance_explorer.md).
- The implementation prompt log is in [`prompts.md`](prompts.md).
- This app was implemented directly with an AI coding assistant rather than through Lovable; the
  saved prompts and decisions are recorded in `prompts.md`.
