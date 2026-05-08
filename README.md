<h1 align="center">Portfolio</h1>

<p align="center">
  <strong>Drive the circuit.</strong><br/>
  A stylized Suzuka-inspired portfolio — procedural F1 scene, checkpoint stations, golden-hour ambience.
</p>

<br/>

---

<br/>

### What’s inside

- **Home** loads a boot sequence (`AdvancedLoadingSystem`), then mounts the **interactive circuit** (`F1TrackPortfolio`) client-side so WebGL starts cleanly.
- **Three.js** scene: procedural **W15-style** car, thick ribbon track with crossover bridge, Japanese landscape props, GSAP-fed HUD and centred station modals.
- **Driving loop**: chase camera, track-height sampling, off-track slowdown, cylindrical colliders — no external car GLB committed by default.

<br/>

### Stack

| Layer | Notes |
|:---:|:---|
| **App** | [Next.js&nbsp;15](https://nextjs.org/) · App Router · [React&nbsp;19](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) |
| **UI** | [Tailwind CSS](https://tailwindcss.com/) · [Radix](https://www.radix-ui.com/) primitives · [Lucide](https://lucide.dev/) · [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) · [`class-variance-authority`](https://cva.style/docs) |
| **3D** | [Three.js](https://threejs.org/) (@types included) · modular `components/f1/scene/` (track, car, sky, env, stations) |
| **Motion** | [GSAP](https://greensock.com/gsap/) — preloader choreography, overlays |
| **Forms & data** (where used) | [React Hook Form](https://react-hook-form.com/) · [Zod](https://zod.dev/) · [Recharts](https://recharts.org/) · [`cmdk`](https://cmdk.paco.me/) |
| **Theming** | [`next-themes`](https://github.com/pacocoursey/next-themes) |

The hero experience is **`dynamic(..., { ssr: false })`** from [`app/page.tsx`](app/page.tsx) so the Three bundle stays client-only.

<br/>

### Layout

```
app/                    ← App Router entry, preloader → circuit
components/
├── f1-track-portfolio.tsx
├── advanced-loading-system.tsx
├── f1/scene/           ← buildScene, track, car, environment, stations, sky, palette
├── ui/
└── …
```

<br/>

### Run it

Requires **Node 20+**. Install with **pnpm** (lockfile: `pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

<br/>

### Large assets

`.glb` / `.gltf` patterns are ignored in Git (see [`.gitignore`](.gitignore)); the showcased car is **generated in code**. Drop models under **`public/`** if you add them later.

<br/>

<p align="center">
  <sub>Portfolio content is personal. Third‑party libraries follow their own licenses.</sub>
</p>
