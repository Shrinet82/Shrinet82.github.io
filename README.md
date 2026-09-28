# Shrinet82.github.io

Portfolio of Shashwat Pratap Singh: painter, poet and platform engineer.
Live at https://shrinet82.github.io/

The site is a sketchbook. Every plate tells one piece of the DevOps work in
a single harbour world: Kubernetes is Greek for *helmsman*, so the cluster is
a container ship and the Docker containers are its cargo.

## Stack

- Vite + React + TypeScript
- [Remotion](https://www.remotion.dev/) compositions embedded with `@remotion/player`
  (`src/remotion/`). Plates I to IV are scrubbed frame by frame by the scroll;
  the hero loops.
- GSAP ScrollTrigger and SplitText for page-level motion (`src/motion.ts`)
- Fraunces, Instrument Sans and IBM Plex Mono

```bash
npm install
npm run dev      # the site
npm run studio   # Remotion Studio: preview and tweak the compositions
npm run build    # production build (deployed by .github/workflows/deploy.yml)
```

## How it was made

Designed and built with Claude Code, guided by these agent skills:

- **Remotion** ([remotion-dev/skills](https://github.com/remotion-dev/skills)):
  `remotion-best-practices`, `remotion-markup` (sequencing, timing, fonts),
  `remotion-interactivity`, `remotion-saas` (Player) and `remotion-render`
  (rendering stills for visual checks)
- **tastemaker** ([codeswithroh/tastemaker](https://github.com/codeswithroh/tastemaker)):
  narrative arc, copy voice, anti-slop checklist, animation guidelines and the motion audit
- **no-ai-design-slop** ([MengTo/Skills](https://github.com/MengTo/Skills))
- **emil-design-eng** ([emilkowalski/skills](https://github.com/emilkowalski/skills)):
  easing, timing and interaction feedback
- **landing-page-design** ([elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills)):
  type discipline and the word-by-word tagline reveal
- **web-design-engineer** ([ConardLi/garden-skills](https://github.com/ConardLi/garden-skills)):
  design directions

Every number on the site comes from the resume or the project READMEs.
