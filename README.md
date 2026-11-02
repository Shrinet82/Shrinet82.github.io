# Shrinet82.github.io

Portfolio of Shashwat Pratap Singh (Shrinet), independent DevOps and platform engineer.
Live at https://shrinet82.github.io/devops-portfolio/

The site is a control plane. Each flagship project (Aegis Observe, OPSIE,
Aegis Governance, Zero-Trust on AKS) is a Remotion composition that your scroll
plays frame by frame, and the hero is a `git push` rolling out to production.

## Stack

- Vite + React + TypeScript
- [Remotion](https://www.remotion.dev/) scenes in `src/remotion/`, rendered on the page
  with `@remotion/player`'s `Thumbnail` at the frame the scroll asks for
- `src/scroll.ts`: one rAF scroll loop; scene updates are flushed in the same frame
  as the scroll, so no animation trails behind the page
- CSS `position: sticky` for the pinned scenes, scroll-driven CSS for the reveals
- Geist and Geist Mono

```bash
npm install
npm run dev      # the site
npm run studio   # Remotion Studio: preview, tweak or render any scene as a video
npm run build    # production build (deployed by .github/workflows/deploy.yml)
```

All copy lives in `src/content.ts`. Every number on the site comes from the
resume or a project README.
