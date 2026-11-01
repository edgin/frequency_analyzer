# Prompt and decision log — Delay Resonance Explorer

This project was implemented directly with an AI coding assistant instead of through Lovable. The
prompts and decisions that produced it are recorded below for the assignment submission.

The full assignment-ready build brief is section 4 of
[`delay_resonance_explorer.md`](delay_resonance_explorer.md). It is the effective specification that
was implemented.

## Prompt 1 — Source specification

**Date:** 2026-11-01
**Purpose:** Provide the product and assignment specification.

**Prompt (user):** Shared `delay_resonance_explorer.md` and asked whether the app described in the
Markdown file could be seen.

**Result:** Confirmed the file exists and contains the original product prompt, an assignment gap
analysis, a revised Lovable-ready prompt, Supabase schema and RLS, DSP notes, routes, test checklist
and submission plan.

## Prompt 2 — Analysis

**Date:** 2026-11-01
**Purpose:** Review the specification before building.

**Prompt (user):** “yes analyze it”

**Result:** Analysis identified these issues to fix:

1. The preset schema had no `filter_type`, so feedforward/feedback mode could not be restored.
2. Deleting a preset would orphan `<user_id>/<preset_id>.wav` because storage has no FK cascade.
3. `audio_renders` allowed multiple rows per preset while the detail page assumed one.
4. Guest save preserved settings only as an intention, with no draft mechanism.
5. Continuous `requestAnimationFrame` redraw was unnecessarily expensive.
6. The dB axis had no floor, risking `log10(0)`.
7. There were no automated tests for the math or WAV encoder.
8. The read policy allowed any authenticated user to read all presets.

## Prompt 3 — Build request and decisions

**Date:** 2026-11-01
**Purpose:** Build the app in this repository.

**Prompt (user):** Answered the planning questions:

- Build the app now in the empty repo: **yes**
- Implement directly with code, not Lovable: **no Lovable**
- Fix the identified gaps: **yes**
- Preset visibility: **owner only for now**
- Proceed with implementation: **“lets”**

**Effective brief:** Implement the revised specification directly as a React + TypeScript + Vite app
with Tailwind, React Router, Web Audio API and Supabase. Use owner-only RLS for presets and storage.
Apply the fixes listed in Prompt 2. Add Vitest tests and submission documentation.

**Result:** Delivered:

- DSP math, clamps and unit tests
- Canvas frequency-response graph with hover inspection
- Live mono/stereo Web Audio engine with limiter and safe feedback
- All four test signals and built-in presets
- Email/password auth and protected preset routes
- Owner-only preset CRUD and private WAV snapshot storage
- Guest draft restoration through login
- Migration SQL, README, environment example and deployment rewrites

## Prompt 4 — Verification

**Date:** 2026-11-01
**Purpose:** Verify the implementation.

**Actions:** Ran `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.

**Result:** Type-check and production build pass. The 23 unit tests pass. Oxlint reports advisory
React effect warnings only.

## Supabase follow-up required

The user still needs to provide:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in the Supabase SQL
Editor. Auth email settings and the deployed URL must also be configured as described in the README.