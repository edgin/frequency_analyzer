# Delay Resonance Explorer — Prompt and Supabase Assignment Plan

> Source: user-supplied prompt, adapted for `test_01.PDF` — “Assignment: From Idea to Working MVP with Lovable and Supabase”.
>
> This document contains the original prompt, the assignment gap analysis, the assignment-ready revised prompt, the Supabase data model, and the implementation/test/submission plan.

---

## 1. Original prompt (verbatim)

````text
# Build an Interactive Delay Resonance Explorer

Create a small, elegant, interactive web application called **Delay Resonance Explorer**.

The purpose is to demonstrate how very short audio delay times create resonant frequencies through comb filtering, and how feedback produces metallic, ringing aftertones.

The application should be both an educational visualization and an experimental sound-design tool.

## Technology

- React + TypeScript + Vite
- Web Audio API for sound generation and processing
- SVG or Canvas for frequency-response visualization
- Tailwind CSS for styling
- No backend, database, or authentication
- Fully functional in the browser

## 1. Main delay-time slider

Create a large horizontal slider controlling delay time.

- Range: 1–50 milliseconds
- Default: 10 ms
- Step: 0.1 ms
- Display the current delay time prominently
- Update calculations and graphs immediately when the slider moves

Calculate the fundamental resonance spacing using:

`f = 1000 / delayTimeMs`

Display:

- Delay time in milliseconds
- Resonance spacing in Hz
- First five theoretical resonance frequencies

For example, at 10 ms:

- 100 Hz
- 200 Hz
- 300 Hz
- 400 Hz
- 500 Hz

Explain that these are frequency peaks created by an ideal delay-feedback system, not necessarily the fundamental pitch of the incoming sound.

## 2. Interactive frequency-response graph

Create a large real-time visualization showing the comb-filter frequency response.

Requirements:

- Horizontal axis: Frequency (Hz), from 0 to 3000 Hz
- Vertical axis: Relative amplitude or gain
- Peaks show reinforced frequencies
- Dips show attenuated frequencies
- Update smoothly when delay time changes
- Display frequency labels and gridlines
- Allow users to hover over peaks to inspect frequencies

Use a mathematically accurate model of a feedforward comb filter for the initial visualization:

`H(f) = 1 + g * exp(-j * 2π * f * T)`

where:

- `T` is delay time in seconds
- `g` is the delayed signal gain
- `f` is frequency

Calculate and plot the magnitude of this complex frequency response.

## 3. Feedback control

Add a second slider:

- Range: 0–98%
- Default: 95%

Provide an option to switch the visualization between:

**Feedforward comb filter**

`H(f) = 1 + g * exp(-j * 2π * f * T)`

**Feedback comb filter**

`H(f) = 1 / (1 - g * exp(-j * 2π * f * T))`

Use the feedback slider as `g` in feedback mode. In feedforward mode, label it as delayed-signal gain instead.

Explain how higher feedback produces stronger, narrower resonances and longer decay times.

## 4. Audio experiment

Use the Web Audio API to let the user actually hear the effect.

Provide:

- Play/Stop button
- Test signal selection: sine wave, sawtooth, white noise, and short percussive impulse
- Input frequency slider for oscillators: 50–1000 Hz
- Dry/Wet control
- Delay-time control
- Feedback control

Implement a real feedback delay using DelayNode, GainNode, and appropriate signal routing.

The sound should change in real time when adjusting the sliders.

Add a limiter or safe output gain to prevent unexpectedly loud feedback.

Audio must start only after user interaction, following browser autoplay restrictions.

## 5. Stereo delay experiment

Add an optional stereo mode inspired by Ableton's Harmonics Delay preset.

Default values:

- Left delay: 10 ms
- Right delay: 15 ms
- Feedback: 95%
- Dry/Wet: 40%

Allow independent adjustment of left and right delay times.

Visualize the two resonance patterns using different colors.

Provide a button to switch between mono and stereo modes.

## 6. Visual design

Create a minimal, dark interface inspired by professional audio plugins and laboratory instruments.

- Dark charcoal background
- Cyan for left-channel resonances
- Amber for right-channel resonances
- Large, precise numeric readouts
- Smooth, responsive sliders
- Clean typography
- Responsive layout for desktop and mobile

The frequency-response graph should be the central visual element.

## 7. Educational information

Include a small collapsible explanation panel covering:

- What is comb filtering?
- Why does delay time affect frequency?
- Why do short delays sound metallic?
- How does feedback create ringing aftertones?
- Difference between delay, resonance, and pitch shifting

Use short explanations with practical examples.

## 8. Presets

Add selectable presets:

| Preset | Delay |
|---|---|
| Metallic Ring | 3 ms |
| Harmonic Resonance | 10 ms |
| Deep Resonance | 20 ms |
| Short Echo | 50 ms |
| Ableton-inspired Stereo | L: 10 ms / R: 15 ms |

Presets should update all relevant controls and visualizations.

## Important implementation requirements

- All calculations must be mathematically correct.
- The graph must update continuously without unnecessary React re-renders.
- Smooth delay-time parameter changes using Web Audio API parameter automation to minimize clicks.
- Ensure audio feedback loops are implemented safely.
- Use sensible gain staging and output limiting.
- Clearly distinguish the theoretical frequency-response visualization from the actual audio output.
- The application must work as a complete, usable experiment, not merely a visual mockup.

## Final goal

I want to move a delay-time slider and immediately **see and hear how the resonant frequencies change**.

The app should help me understand and experiment with the metallic resonances created by very short delay times, similar to the sounds I discovered using Ableton's Harmonics Delay preset.
````

---

## 2. Why the original prompt is not yet assignment-ready

The original prompt is a strong product spec, but it conflicts with the assignment requirements:

| Original prompt | `test_01` assignment requirement |
|---|---|
| “No backend, database, or authentication” | App must be connected to Supabase and a database |
| No user accounts | Register, login and logout are required |
| Single explorer view | At least three pages and navigation are required |
| No persistence | Form data must be saved in Supabase |
| No database display | Data from the database must be shown on a separate page |
| No detail view | Clicking a selected record must show its details |
| Not specified | App must be tested and deployed online |
| Not specified | App link, project description, saved prompts and GitHub repo must be submitted |

The concept is still usable. The fix is to keep the explorer fully client-side for DSP and add **Supabase as a persistence and sharing layer**, not as an audio processor.

---

## 3. Assignment requirements mapping

| Assignment criterion | How the revised app satisfies it |
|---|---|
| Clear idea and use case | Educational audio tool for visualising comb-filter resonance |
| Prompt quality | Detailed, structured prompt with pages, data model, auth, UI and audio rules |
| Lovable usage | App generated in Lovable with React + TypeScript + Tailwind |
| UI | Dark professional audio-plugin interface with cyan/amber curves |
| Navigation | Explore, Presets, Preset Detail, Login and Register pages |
| Data-entry form | “Save Preset” form with name, description and current parameters |
| Supabase connection | Auth, `presets` and `audio_renders` tables + Storage bucket |
| Data display | Preset library reads saved presets from Supabase |
| Authentication | Supabase email/password register, login and logout |
| Detail view | `/presets/:id` shows parameters, response graph and saved audio |
| Testing | Manual QA checklist for audio, auth, CRUD, RLS, mobile and console |
| Documentation | This document, README, prompt log and short project description |

---

## 4. Assignment-ready revised prompt

The following prompt is ready to paste into Lovable after Supabase has been connected to the project.

````text
Build an interactive web application called "Delay Resonance Explorer".

Purpose:
Demonstrate how very short audio delay times create resonant frequencies through comb filtering, and how feedback produces metallic, ringing aftertones. The app is both an educational visualization and an experimental sound-design tool.

Technology:
- React + TypeScript + Vite
- Tailwind CSS
- Web Audio API for sound generation and processing
- Canvas or SVG for the frequency-response visualization
- React Router for navigation
- Supabase for authentication, preset persistence and audio snapshot storage
- Deployable to Lovable Publish, Vercel or Netlify

Important architecture rule:
The audio DSP must remain client-side in the browser using the Web Audio API. Supabase must be used only for authentication, saved preset metadata and audio snapshot storage. Do not move audio processing to Supabase.

==================================================
AUTHENTICATION AND PAGES
==================================================

Use Supabase Auth with email/password authentication.

Pages and routes:
1. "/" — Explore: the main interactive delay/resonance tool
2. "/presets" — Preset Library: saved presets loaded from Supabase
3. "/presets/:id" — Preset Detail: saved parameters, response graph and audio snapshot
4. "/login" — Login
5. "/register" — Register

Navigation:
- Header or sidebar with links: Explore, Presets, Login/Register or account email + Logout.
- Show the logged-in user's email and a Logout button.
- The Explore page must be usable without login so visitors can experiment immediately.
- Saving a preset, generating an audio snapshot, and managing presets require login.
- If a guest tries to save, show a clear message and link to login/register.
- All preset library and detail routes require authentication.

==================================================
CORE EXPLORER
==================================================

Main delay-time slider:
- Range: 1–50 ms
- Default: 10 ms
- Step: 0.1 ms
- Prominent numeric readout
- Update graph and calculations immediately

Calculate resonance spacing:
f = 1000 / delayTimeMs

Display:
- Delay time in ms
- Resonance spacing in Hz
- First five non-zero theoretical resonance frequencies
- A note that these are peaks of an ideal delay system, not necessarily the pitch of the input sound

At 10 ms the first five non-zero peaks are 100, 200, 300, 400 and 500 Hz.

Feedback control:
- Range: 0–98%
- Default: 95%
- In feedback mode, label it Feedback
- In feedforward mode, label it Delayed-signal gain

Filter mode switch:
- Feedforward comb filter: H(f) = 1 + g * exp(-j * 2π * f * T)
- Feedback comb filter: H(f) = 1 / (1 - g * exp(-j * 2π * f * T))

Frequency-response graph:
- Horizontal axis: 0–3000 Hz
- Vertical axis: gain in dB
- Plot the magnitude of the selected complex response
- Peaks show reinforced frequencies; dips show attenuated frequencies
- Frequency labels and gridlines
- Hovering over a peak shows the frequency and gain
- Update smoothly while sliders move
- Use a display ceiling so feedback resonance never produces infinity
- Keep the graph as the central visual element

Audio experiment:
- Play/Stop button
- Test signal selection: sine wave, sawtooth, white noise, and short percussive impulse
- Input frequency slider for oscillator signals: 50–1000 Hz
- Dry/Wet control
- Delay-time control
- Feedback control
- Real feedback delay using DelayNode, GainNode and correct signal routing
- Real-time changes while the audio is playing
- Limiter/DynamicsCompressor and safe master gain to prevent loud feedback
- Audio starts only after a user gesture, following browser autoplay restrictions
- Clearly distinguish the theoretical graph from the actual audio output

Stereo mode:
- Toggle between mono and stereo
- Left delay default: 10 ms
- Right delay default: 15 ms
- Feedback default: 95%
- Dry/Wet default: 40%
- Independent left/right delay controls
- Two response curves: cyan for left, amber for right
- A stereo preset must load all relevant values

Built-in presets:
| Preset | Delay |
|---|---|
| Metallic Ring | 3 ms |
| Harmonic Resonance | 10 ms |
| Deep Resonance | 20 ms |
| Short Echo | 50 ms |
| Ableton-inspired Stereo | L: 10 ms / R: 15 ms |

Presets must update every relevant control and the visualization.

Visual design:
- Minimal dark interface inspired by professional audio plugins and laboratory instruments
- Dark charcoal background
- Cyan for left-channel resonances
- Amber for right-channel resonances
- Large precise numeric readouts
- Smooth responsive sliders
- Clean typography
- Responsive layout for desktop and mobile

Educational panel:
Include a collapsible panel with short explanations:
- What is comb filtering?
- Why does delay time affect frequency?
- Why do short delays sound metallic?
- How does feedback create ringing aftertones?
- Difference between delay, resonance and pitch shifting

==================================================
SUPABASE DATA AND STORAGE
==================================================

Use Supabase Auth, Postgres and Storage.

Create these tables:

presets:
- id uuid primary key default gen_random_uuid()
- user_id uuid not null references auth.users(id) on delete cascade
- name text not null
- description text
- mode text not null check (mode in ('mono', 'stereo'))
- delay_left_ms numeric not null
- delay_right_ms numeric not null
- feedback numeric not null
- dry_wet numeric not null
- signal_type text not null
- input_freq numeric
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

audio_renders:
- id uuid primary key default gen_random_uuid()
- preset_id uuid not null references presets(id) on delete cascade
- user_id uuid not null references auth.users(id) on delete cascade
- storage_path text not null
- duration_seconds numeric not null
- sample_rate integer not null
- created_at timestamptz not null default now()

Constraints:
- delay_left_ms and delay_right_ms between 1 and 50
- feedback between 0 and 0.98
- dry_wet between 0 and 1
- input_freq between 50 and 1000 when present

Row Level Security:
- Enable RLS on presets and audio_renders.
- Authenticated users may read presets.
- Users may insert, update and delete only their own presets.
- Authenticated users may read audio_renders.
- Users may insert and delete only their own audio_renders.
- Do not allow anonymous access.

Storage:
- Create a private bucket called "preset-audio".
- Store files at: <user_id>/<preset_id>.wav
- Authenticated users may read preset audio.
- Users may upload and delete files only inside their own <user_id>/ folder.
- Use signed URLs to play audio in the detail page.
- Store the path in audio_renders.storage_path.

If database changes cannot be applied automatically, generate the complete SQL migration and tell me to run it in the Supabase SQL Editor.

Environment variables:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
Do not hardcode keys in source files. Never expose the service_role key in the frontend.

==================================================
SAVE PRESET AND AUDIO SNAPSHOT FLOW
==================================================

Save Preset form:
- Name (required)
- Description (optional)
- Automatically capture: mode, delay left/right, feedback, dry/wet, signal type, input frequency
- Save to Supabase
- After saving, show success and offer "Generate audio snapshot"

Audio snapshot:
- Use OfflineAudioContext to render 8–10 seconds of the current preset.
- Recreate the same delay/feedback graph used by the live audio engine.
- Encode the rendered AudioBuffer as WAV in a utility function.
- Upload the WAV to Supabase Storage at <user_id>/<preset_id>.wav
- Insert a row into audio_renders with the storage path, duration and sample rate.
- Keep files small; do not store audio blobs in the database.

Preset Library:
- Fetch presets from Supabase.
- Show cards with name, description, mode, delay values, feedback, creation date.
- Provide open/detail action.
- Show empty, loading and error states.

Preset Detail:
- Route /presets/:id
- Fetch the preset and its audio_render row.
- Recreate the frequency-response graph from saved parameters.
- Show all saved parameters.
- Generate a signed URL and play the audio snapshot with an <audio> element.
- Provide "Load in Explorer" to copy the preset into the main tool.
- Only the owner sees Edit and Delete actions.

==================================================
IMPLEMENTATION REQUIREMENTS
==================================================

Mathematical correctness:
- Feedforward magnitude: |1 + g * exp(-j * 2π * f * T)|
- Feedback magnitude: 1 / |1 - g * exp(-j * 2π * f * T)|
- Peaks occur at f = k / T for integer k.
- At 10 ms, T = 0.01 s and spacing is 100 Hz.
- Exclude or label the 0 Hz DC point when showing "first five" peaks.
- Use a dB scale for the graph.
- Clamp feedback gain to 0.98 and the display ceiling to a safe value.

Audio safety:
- Use a DynamicsCompressorNode as a limiter.
- Use a conservative master gain.
- Add short fade-in/fade-out when starting/stopping.
- Never allow feedback gain >= 1.
- Smooth delay-time changes with setTargetAtTime to reduce clicks.
- Note that changing delay time inside a feedback loop can create pitch artefacts; this is expected behaviour.

Performance:
- Draw the graph on Canvas with requestAnimationFrame.
- Keep audio nodes in refs.
- Do not recreate the AudioContext or audio graph on every slider move.
- Avoid unnecessary React re-renders while the graph animates.
- Resize the canvas correctly for device pixel ratio.

Graph interaction:
- Convert pointer position to frequency.
- Find the nearest resonance peak.
- Show a tooltip with frequency and gain.
- Keep hover interaction working in both mono and stereo modes.

Code organisation:
- src/components — reusable UI and graph components
- src/pages — Explore, Presets, PresetDetail, Login, Register
- src/lib/supabase.ts — Supabase client
- src/lib/audio — audio engine, WAV encoder, graph math
- src/lib/presets.ts — preset types and helpers

Scope guard:
- Do not add Realtime collaboration, likes, payments, public anonymous sharing, notifications, charts unrelated to the resonance graph, or extra modules in this version.
- Keep the app focused on the delay/resonance experiment and the saved-preset workflow.

Deliverables:
- Working React app
- Supabase schema and RLS
- Save/load preset flow
- Audio snapshot upload/playback
- Responsive dark UI
- No TypeScript errors
- No browser console errors
````

---

## 5. Supabase architecture

### 5.1 Scope

Included:

- Supabase Auth: email/password register, login, logout
- `presets` table: saved parameter sets
- `audio_renders` table: metadata for rendered WAV snapshots
- Private Storage bucket `preset-audio`
- RLS: authenticated reads, owner-only writes

Excluded from v1:

- Realtime collaboration
- Likes, comments, trending
- Public anonymous share links
- Payments or subscriptions
- Server-side audio processing

### 5.2 Data model

| Table | Purpose | Key columns |
|---|---|---|
| `presets` | Saved explorer configurations | `user_id`, `name`, `description`, `mode`, `delay_left_ms`, `delay_right_ms`, `feedback`, `dry_wet`, `signal_type`, `input_freq` |
| `audio_renders` | WAV snapshots attached to presets | `preset_id`, `user_id`, `storage_path`, `duration_seconds`, `sample_rate` |

### 5.3 SQL migration

```sql
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  mode text not null default 'mono' check (mode in ('mono', 'stereo')),
  delay_left_ms numeric not null check (delay_left_ms between 1 and 50),
  delay_right_ms numeric not null check (delay_right_ms between 1 and 50),
  feedback numeric not null default 0.95 check (feedback between 0 and 0.98),
  dry_wet numeric not null default 0.4 check (dry_wet between 0 and 1),
  signal_type text not null default 'sine'
    check (signal_type in ('sine', 'sawtooth', 'noise', 'impulse')),
  input_freq numeric check (input_freq between 50 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_renders (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.presets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  duration_seconds numeric not null check (duration_seconds > 0),
  sample_rate integer not null check (sample_rate > 0),
  created_at timestamptz not null default now()
);

create index if not exists presets_user_id_created_at_idx
  on public.presets (user_id, created_at desc);

create index if not exists audio_renders_preset_id_idx
  on public.audio_renders (preset_id);

grant select, insert, update, delete on public.presets to authenticated;
grant select, insert, delete on public.audio_renders to authenticated;

alter table public.presets enable row level security;
alter table public.audio_renders enable row level security;

drop policy if exists "Authenticated users can read presets" on public.presets;
create policy "Authenticated users can read presets"
  on public.presets for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own presets" on public.presets;
create policy "Users can insert their own presets"
  on public.presets for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own presets" on public.presets;
create policy "Users can update their own presets"
  on public.presets for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own presets" on public.presets;
create policy "Users can delete their own presets"
  on public.presets for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Authenticated users can read audio renders" on public.audio_renders;
create policy "Authenticated users can read audio renders"
  on public.audio_renders for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their own audio renders" on public.audio_renders;
create policy "Users can insert their own audio renders"
  on public.audio_renders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own audio renders" on public.audio_renders;
create policy "Users can delete their own audio renders"
  on public.audio_renders for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists presets_set_updated_at on public.presets;
create trigger presets_set_updated_at
  before update on public.presets
  for each row
  execute function public.set_updated_at();
```

### 5.4 Storage setup

```sql
-- Private bucket for rendered WAV snapshots.
insert into storage.buckets (id, name, public)
values ('preset-audio', 'preset-audio', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read preset audio" on storage.objects;
create policy "Authenticated users can read preset audio"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'preset-audio');

drop policy if exists "Users can upload their own preset audio" on storage.objects;
create policy "Users can upload their own preset audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own preset audio" on storage.objects;
create policy "Users can delete their own preset audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'preset-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 5.5 Environment variables

Local `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Add the same variables to Lovable/Vercel/Netlify deployment settings.

Rules:

- Use the `anon` key in the browser.
- Never expose the `service_role` key.
- Never commit `.env` files or keys.
- RLS must remain enabled because the anon key is public.

---

## 6. Pages, routes and user flow

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Main explorer; audio starts on user gesture; optional save button |
| `/presets` | Authenticated | Library of presets loaded from Supabase |
| `/presets/:id` | Authenticated | Detail view with graph, parameters and audio snapshot |
| `/login` | Public | Email/password login |
| `/register` | Public | Email/password registration |

Primary user flow:

1. Guest opens `/` and experiments with delay, feedback, graph and audio.
2. Guest clicks Save Preset.
3. App asks the guest to register or login.
4. After authentication, the guest returns to the explorer with current settings preserved.
5. User saves a preset with a name and optional description.
6. User generates an audio snapshot.
7. WAV is uploaded to Supabase Storage and metadata is saved in `audio_renders`.
8. User opens `/presets` and sees saved presets.
9. User opens `/presets/:id` to view the graph, parameters and audio snapshot.
10. User clicks “Load in Explorer” to restore the preset.
11. Owner can edit or delete the preset; other authenticated users can only view it.
12. User logs out.

---

## 7. Save preset and audio snapshot flow

### Save preset

1. User clicks Save Preset.
2. Require authentication.
3. Open a form with name and description.
4. Capture the current explorer state.
5. Insert into `presets`.
6. Return the new preset ID.
7. Show success and offer Generate Audio Snapshot.

### Generate audio snapshot

1. Create an `OfflineAudioContext` at 44.1 kHz, stereo, 8–10 seconds.
2. Rebuild the same source → delay/feedback → dry/wet → limiter → master gain graph.
3. Render the buffer.
4. Encode the buffer as WAV.
5. Upload to `preset-audio/<user_id>/<preset_id>.wav`.
6. Insert `storage_path`, `duration_seconds` and `sample_rate` into `audio_renders`.
7. On the detail page, call `createSignedUrl` and play the file with an `<audio>` element.

Snapshot rules:

- Generate from preset parameters, not from microphone input.
- Do not store audio blobs in Postgres.
- Keep the WAV short to stay well below the 50 MB submission limit.
- If no snapshot exists, show a “Generate snapshot” button to the owner.

---

## 8. DSP and audio implementation notes

### 8.1 Frequency-response math

Feedforward comb filter:

```text
H(f) = 1 + g * exp(-j * 2π * f * T)

|H(f)| = sqrt(1 + g² + 2g * cos(2π * f * T))
```

Feedback comb filter:

```text
H(f) = 1 / (1 - g * exp(-j * 2π * f * T))

|H(f)| = 1 / sqrt(1 + g² - 2g * cos(2π * f * T))
```

Where:

- `T = delayTimeMs / 1000` seconds
- `g` is feedback or delayed-signal gain
- `f` is frequency in Hz

Resonance spacing:

```text
spacingHz = 1000 / delayTimeMs
peaks at f = k * spacingHz, k = 0, 1, 2, ...
```

At 10 ms:

- Spacing = 100 Hz
- Peaks = 100, 200, 300, 400, 500 Hz (excluding 0 Hz DC)

At 3 ms:

- Spacing = 333.33 Hz
- Peaks = 333.33, 666.67, 1000, 1333.33, 1666.67 Hz

Feedback peak gain:

```text
peakGain = 1 / (1 - g)
```

Examples:

- `g = 0.95` → 20× ≈ +26 dB
- `g = 0.98` → 50× ≈ +34 dB

Plot in dB:

```text
dB = 20 * log10(|H(f)|)
```

Clamp the display ceiling so `g` near 1 does not produce infinity.

### 8.2 Graph

- Draw on Canvas with `requestAnimationFrame`.
- Keep graph dimensions in refs; resize with `ResizeObserver` and devicePixelRatio.
- Horizontal axis: 0–3000 Hz.
- Vertical axis: dB, with a fixed safe ceiling.
- Draw gridlines and frequency labels at useful intervals.
- Draw left curve cyan and right curve amber in stereo mode.
- Hover: convert pointer x to frequency; find nearest peak; show frequency and gain.
- Do not redraw the entire React tree on every animation frame.

### 8.3 Audio graph

Recommended mono routing:

```text
source
  ├── dryGain ──────────────────────────────┐
  └── inputGain → delay → feedbackGain ─────┤
                         ↑                  │
                         └── delay (loop)   │
                                            ↓
                                       wetGain
                                            ↓
                                      limiter
                                            ↓
                                      masterGain
                                            ↓
                                      destination
```

Requirements:

- `DelayNode.maxDelayTime` at least 0.05 seconds.
- Feedback gain must stay below 1.0; clamp at 0.98.
- Use `DynamicsCompressorNode` as a limiter.
- Use a conservative master gain.
- Add short gain ramps when starting/stopping.
- Smooth delay changes with `setTargetAtTime`.
- Do not create a new AudioContext for every slider movement.

### 8.4 Sources

- Sine and sawtooth: `OscillatorNode`.
- White noise: looping `AudioBufferSourceNode` with a generated noise buffer.
- Impulse: short `AudioBufferSourceNode` with an impulse/percussive buffer; retrigger on Play or a dedicated trigger.

### 8.5 Stereo

- Split the source with `ChannelSplitter`.
- Process left and right with independent delay/feedback chains.
- Merge with `ChannelMerger`.
- Keep separate dry/wet gains per channel or use a shared control.
- Draw two response curves.
- Use the same safety limiter on the merged output.

### 8.6 Performance rules

- Audio nodes live in refs.
- Graph animation uses refs and canvas, not React state per frame.
- Slider state updates only what is necessary.
- Debounce or throttle expensive calculations if needed.
- Avoid recreating the audio graph while parameters change.

---

## 9. Lovable execution plan

The prompt is large. Use this order to avoid wasting free credits:

### Phase 1 — Core explorer

Send the full revised prompt, but prioritise:

- Layout, sliders, graph, mono audio
- Feedback/feedforward math
- Presets and educational panel

### Phase 2 — Supabase foundation

If not already connected, connect Supabase first. Then ask Lovable to:

- Add the schema and RLS from this document
- Add Auth pages and protected routes
- Add save/list/detail preset flow

### Phase 3 — Audio snapshots

Ask Lovable to add:

- `OfflineAudioContext` rendering
- WAV encoder
- Storage upload
- `audio_renders` insert
- Signed URL playback on the detail page

### Phase 4 — Fix and polish

Use one batched message for all fixes:

- Console/TypeScript errors
- Graph performance
- Audio clicks or feedback safety
- Mobile layout
- Empty/loading/error states

### Credit-saving rules

- Do not send many tiny UI prompts.
- Batch related changes into one message.
- Test after each phase.
- Keep the scope guard: no Realtime, likes, payments or public anon sharing in v1.

---

## 10. Test checklist

### Math and graph

- [ ] At 10 ms, spacing is 100 Hz.
- [ ] At 10 ms, the first five non-zero peaks are 100, 200, 300, 400, 500 Hz.
- [ ] At 3 ms, spacing is 333.33 Hz.
- [ ] Feedforward and feedback curves are visibly different.
- [ ] Higher feedback makes peaks stronger/narrower.
- [ ] Feedback display does not show infinity.
- [ ] Hovering shows the correct peak frequency.
- [ ] Stereo mode shows two coloured curves.
- [ ] Graph updates smoothly while dragging.

### Audio

- [ ] Audio starts only after clicking Play.
- [ ] Stop works and fades out cleanly.
- [ ] Sine, sawtooth, noise and impulse all work.
- [ ] Input frequency slider changes oscillator pitch.
- [ ] Delay, feedback and dry/wet change the sound in real time.
- [ ] High feedback does not cause dangerous volume.
- [ ] No loud clicks when starting/stopping.
- [ ] Mono and stereo modes both work.

### Supabase and auth

- [ ] Register with email/password works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Guest can use the explorer.
- [ ] Guest is prompted to login when saving.
- [ ] Save Preset inserts a row in `presets`.
- [ ] Preset Library loads saved presets after refresh.
- [ ] Preset Detail shows parameters and graph.
- [ ] Audio snapshot uploads to `preset-audio`.
- [ ] Audio snapshot plays from the detail page.
- [ ] Owner can edit/delete own presets.
- [ ] Another user cannot edit/delete someone else's preset.
- [ ] RLS is enabled on both tables.
- [ ] No `service_role` key in frontend code.

### UI and quality

- [ ] Dark audio-plugin style looks intentional.
- [ ] Mobile and desktop layouts are usable.
- [ ] Loading, empty and error states exist.
- [ ] No console errors.
- [ ] No TypeScript/build errors.
- [ ] App is deployed and loads over HTTPS.
- [ ] Supabase environment variables are set in production.

---

## 11. Deployment and submission checklist

### Deploy

- [ ] Connect the Lovable project to Supabase.
- [ ] Run the SQL migration and Storage policies.
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to deployment settings.
- [ ] Deploy with Lovable Publish, Vercel or Netlify.
- [ ] Test register/login on the deployed URL.
- [ ] Test saving and loading a preset on the deployed URL.
- [ ] Test audio snapshot playback on the deployed URL.

### GitHub

- [ ] Connect the Lovable project to GitHub.
- [ ] Repository name: `delay-resonance-explorer` or similar.
- [ ] Add a README with:
  - Project description
  - Features
  - Tech stack
  - Supabase setup
  - Installation
  - Screenshots
  - Future improvements
- [ ] Add the live app link to the repository description.
- [ ] Pin the repository on the GitHub profile.

### Submission package

Create a zip named:

```text
ime_prezime_assignment01.zip
```

Include:

- [ ] Live app URL
- [ ] Short project description
- [ ] Saved prompt log (`prompts.md` or this document)
- [ ] GitHub repository URL
- [ ] Screenshots
- [ ] README

If the zip is larger than 50 MB, upload it to WeTransfer and submit the download link.

---

## 12. Prompt log template

Use this section to record the actual prompts sent to Lovable. The assignment asks for the saved prompts.

### Prompt 1 — Initial app

- Date:
- Purpose: Create the core Delay Resonance Explorer
- Prompt: see section 4
- Result summary:

### Prompt 2 — Supabase schema and auth

- Date:
- Purpose: Add Supabase Auth, tables, RLS and preset routes
- Prompt:
- Result summary:

### Prompt 3 — Audio snapshots

- Date:
- Purpose: Add OfflineAudioContext rendering, WAV encoding, Storage upload and playback
- Prompt:
- Result summary:

### Prompt 4 — Fixes and polish

- Date:
- Purpose: Fix TypeScript/console errors, mobile layout, graph performance, audio safety
- Prompt:
- Result summary:

---

## 13. Short project description draft

> Delay Resonance Explorer is an educational audio tool that visualises how very short delay times create comb-filter resonances. Users can adjust delay time, feedback, dry/wet mix and stereo delay settings, then immediately see the frequency-response curve and hear the effect using the Web Audio API. The app includes built-in presets, a collapsible explanation panel and a Supabase-backed preset library where authenticated users can save configurations and rendered audio snapshots for later listening and study.

---

## 14. Future improvements

- Public share links for presets
- Realtime listening room where two users sync parameters
- Likes/trending presets
- pgvector-based “find similar resonance” suggestions
- Export graph as PNG/PDF
- MIDI control
- Mobile touch gestures for the graph
- More test signals and impulse-response import
- A/B comparison of two presets
