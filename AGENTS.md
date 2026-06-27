# EthaDose Agent Guide

## Project

EthaDose is a Next.js (App Router) web app for a local ethanol antidote calculator based on the spreadsheet and article in `context/`. It is built as a static export and deployed as static files on Netlify.

## General Rules

- No emojis and no em-dashes.
- Keep code minimal, typed, and modular.
- Do not leave stale code, unused imports, or dead files behind.
- Comments explain non-obvious behavior only. Do not narrate task history in code comments.
- Never run `git commit`, `git push`, `git tag`, or create PRs. The user handles commits and pushes.
- Do not read, print, or commit secrets. `.env*` files are ignored except `.env.example`.

## App Scope

- v1 is a web app only. No native iOS/Android build.
- The site is a static export (`output: "export"`). Do not add a backend, server runtime, account system, analytics, remote logging, CMS, or cloud hosting unless the user explicitly changes scope.
- The app must calculate locally in the browser by default. Patient inputs must not leave the browser by default.
- A public privacy statement is good to keep available, but no app store submission is in scope.

## Frontend Architecture

- Use the Next.js App Router. Keep route files in `app/` lean.
- Put feature code under `src/features/[feature]`.
- Put reusable UI under `src/components` and shadcn primitives under `src/components/ui`.
- Theme tokens live as CSS variables and Tailwind theme tokens in `app/globals.css` (no React theme context).
- Shared helpers live in `src/lib` (`utils.ts` for `cn`, `site.ts` for site config).
- Use path aliases through `@/*` for files under `src/`.

## Design System

- Use Tailwind CSS v4 with shadcn/ui (new-york). Keep it small for this app.
- Consume the design tokens through Tailwind utilities (for example `bg-primary`, `text-muted-foreground`, `rounded-lg`, `text-title-md`). Do not hardcode colors, font sizes, spacing, or radii when a token exists.
- Keep the app light-mode only unless the user explicitly asks for dark mode.
- Prefer the shadcn primitives (`Button`, `Card`, `Dialog`, `Input`, `Label`, `ToggleGroup`) over bespoke controls.
- Product UI should be calm, clinical, readable, and task-focused. Avoid marketing hero layouts.
- Respect `prefers-reduced-motion` for any animation.

## Clinical Calculator Work

- Treat `context/EtOHcalc.XLS` and `context/PW artikel MeOH intox.pdf` as source material, not runtime dependencies.
- The pure calculation and formatting logic lives in `src/features/calculator/calculations.ts` and `format.ts`. Keep it free of UI/framework imports.
- Add unit tests (Vitest) for all formula behavior before relying on it in UI.
- Clinical copy must clearly state that the app is a calculation aid, not a treatment protocol.
- Do not introduce modern guideline claims without checking current primary or authoritative sources.

## SEO and GEO

- Page metadata (title, description, Open Graph, canonical, robots) lives in `app/layout.tsx`.
- JSON-LD structured data lives in `app/page.tsx`; FAQ/source copy is shared from `src/features/calculator/content.ts`.
- `app/robots.ts`, `app/sitemap.ts`, and `public/llms.txt` cover crawler and AI-engine access.
- The canonical site URL comes from `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL`, default `https://ethadose.netlify.app`).

## Verification

After frontend changes, run when dependencies are installed:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm run build` produces the static export in `out/`.

## Process Cleanup

- Before finishing a task, stop every development server, test watcher, browser process, or other long-running process started for that task.
- Confirm that no project-specific watcher or server remains active before sending the final response.
- Prefer one-shot verification commands such as `npm test` over watch mode unless continuous watching is required during the task.
