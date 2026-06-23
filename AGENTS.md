# Calcohol Agent Guide

## Project

Calcohol is an Expo React Native app for a local ethanol antidote calculator based on the spreadsheet and article in `context/`.

The current repository contains scaffold only. Do not add clinical calculator behavior unless the user explicitly asks for the implementation step.

## General Rules

- No emojis and no em-dashes.
- Keep code minimal, typed, and modular.
- Do not leave stale code, unused imports, or dead files behind.
- Comments explain non-obvious behavior only. Do not narrate task history in code comments.
- Never run `git commit`, `git push`, `git tag`, or create PRs. The user handles commits and pushes.
- Do not read, print, or commit secrets. `.env*` files are ignored except `.env.example`.

## App Scope

- v1 is app-only for iOS and Android.
- Do not add a backend, account system, analytics, remote logging, CMS, or AWS hosting unless the user explicitly changes scope.
- The app must calculate locally on-device by default.
- Patient inputs must not leave the device by default.
- A public privacy policy URL is still required for store submission. The preferred host is GitHub Pages from this repository.

## Frontend Architecture

- Use Expo Router. Keep route files in `app/` lean.
- Put feature code under `src/features/[feature]`.
- Put reusable UI under `src/components` and `src/components/ui`.
- Put theme state and tokens under `src/state`.
- Use path aliases through `@/*` for files under `src/`.

## Design System

- Follow the Remedice-inspired pattern, but keep it small for this app.
- Use `useTheme()` tokens for spacing, radius, color, and typography.
- Keep the app light-mode only unless the user explicitly asks for dark mode.
- Use `AppText` for user-facing text.
- Use `PrimaryButton` for buttons.
- Use `Screen` for safe-area and max-width layout.
- Use `AppIcon` for Lucide icons.
- Do not hardcode colors, font sizes, spacing, or radii in feature screens when a token exists.
- Product UI should be calm, clinical, readable, and task-focused. Avoid marketing hero layouts.

## Clinical Calculator Work

- Treat `context/EtOHcalc.XLS` and `context/PW artikel MeOH intox.pdf` as source material, not runtime dependencies.
- Implement formulas in typed TypeScript modules.
- Add unit tests for all formula behavior before relying on it in UI.
- Clinical copy must clearly state that the app is a calculation aid, not a treatment protocol.
- Do not introduce modern guideline claims without checking current primary or authoritative sources.

## Verification

After scaffold or frontend changes, run when dependencies are installed:

```bash
npm run lint
npm run typecheck
```

After calculator logic is added, also run formula unit tests.
