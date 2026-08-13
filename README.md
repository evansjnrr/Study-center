# Personal Study Center — A-Level visual study room

A local-first, single-user study tool for Cambridge A-Level **Physics 9702**,
**Economics 9708** and **Computer Science 9618**. Three things, done well:

- **Physics — see it move.** A detailed concept page for every 9702 topic: the key
  equations (rendered maths) and an in-depth breakdown. **12 topics** are fully
  **interactive** — drag sliders and watch the physics respond (projectile motion,
  F=ma, circular motion, SHM, waves, superposition, DC circuits, fields, ideal gas,
  capacitor charging, and the photoelectric effect).
- **Economics — your graphs.** Every core 9708 diagram, **editable by dragging the
  curves**. Each comes with a concrete **real-world example**, a full "how the
  diagram works" breakdown, evaluation points, and key terms. Your edits (curve
  shapes, labels, notes) **save to this device** and reopen exactly as you left them.
- **Computer Science — worked & alternatives.** Every 9618 topic with a worked
  example (pseudocode, SQL, trace tables) plus an optional **alternative approach**
  you can reveal and compare (e.g. linear vs binary search, symmetric vs public-key,
  compiler vs interpreter). Interactive tools: an 8-bit number-base converter and a
  bubble-sort visualizer.

**Study tools** (grounded in the evidence on effective revision — active recall,
spacing, Pomodoro, interleaving, Feynman):

- **Spaced-repetition flashcards** — an SM-2 scheduler resurfaces cards just before
  you'd forget them; ~45 high-yield seed cards across the three subjects, an
  interleaved "mixed review", and add-your-own. (`src/features/cards`, `src/lib/srs.ts`)
- **Pomodoro focus timer** in the top bar (25/5 or 50/10), running across the app.
- **Feynman "explain it back"** on every concept page — write it in your own words;
  saved locally per concept.
- **Exam countdown** on the home screen (real Oct–Nov 2026 dates).

There are no past papers, questions, or automated marking — this app is visual
representations, graphs, worked examples and evidence-based revision tools.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. No API key or account needed — everything runs locally and
nothing is sent anywhere. Toggle light/dark (true black) from the top bar.

```bash
npm run build      # production build
npm run typecheck  # tsc, no emit
```

## Install as an app (PWA)

It's an installable, offline-capable Progressive Web App. Build + serve locally:

```bash
npm run build
npm run preview        # serves http://localhost:4173
```

Open that URL in Chrome/Edge and click the install icon in the address bar. Once
loaded, it works fully offline (service worker precaches the shell, self-hosted
fonts, and KaTeX). On iOS: Safari → Share → Add to Home Screen.

## Deploy (GitHub → Vercel, auto-deploy on push)

This repo is wired for Vercel (`vercel.json`) and Netlify (`netlify.toml`). The
one-time setup: create a GitHub repo, push, then import it at vercel.com. After
that, deploying is automatic — every push rebuilds and redeploys:

```bash
git add -A
git commit -m "what changed"
git push               # Vercel auto-builds + deploys in ~30s
```

Only the static app is hosted; all study data stays in each device's IndexedDB
(use Settings → Export/Import to move it between devices).

## Structure

- `src/features/visualize/*` — physics concept pages. `registry.tsx` holds every
  topic's equations + detailed notes; `mechanics/waves/circuits/fields.tsx` are the
  interactive SVG models; `Visualize.tsx` is the hub + detail screen.
- `src/features/econ/*` — economics graphs. `diagrams.ts` defines each diagram's
  geometry and its real-world example + breakdown; `DiagramEditor.tsx` is the
  drag-to-edit SVG with persistence; `EconGraphs.tsx` is the library + detail screen.
- `src/lib/db.ts` — IndexedDB (two stores: saved diagram edits + settings).
- `src/lib/store.ts` — app state + lightweight router (home / physics / econ / settings).

## Stack

React 18 · TypeScript · Vite · Tailwind (warm light + true-black dark) · IndexedDB
(`idb`) · KaTeX · Zustand.
