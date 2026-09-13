# Global Appearance Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or inline TDD execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the lower-left settings panel customize global appearance: default theme, watercolor colorful mode, custom light/dark/selection colors, and global font.

**Architecture:** Keep existing MD3 CSS variables as the component contract. Add a small typed appearance module/store that writes `data-theme`, `data-appearance`, and validated CSS custom properties before paint; add a separate CSS override file for colorful/custom layers; split settings UI into focused subcomponents.

**Tech Stack:** Next 16, React 19, Zustand, Tailwind v4 CSS variables, Vitest/Testing Library, node:test for pure TS.

---

## PADC Scope

- **P (Plan):** Map current global CSS blocks, theme store, settings entry, selection highlight, font variables, and tests. Save this plan and commit it.
- **A (Act):** Add failing tests for the new appearance model and settings UI, then implement the model, CSS layer, and folded settings layout.
- **D (Debug):** Run targeted tests, fix type/lint/component issues, verify no feature regressions from theme persistence or selection highlighting.
- **C (Check):** Run encoding checks, targeted U+FFFD scans, lint/type/build gates as practical, and write automation memory.

## File Structure

- Create `lib/theme/appearance.ts`: pure types, defaults, color validation, font choices, token generation, localStorage read/write helpers, and DOM application helpers.
- Modify `lib/hooks/useTheme.ts`: keep `theme` API compatible while adding appearance mode, custom colors, font choice, hydrate/apply methods.
- Create `app/styles/appearance.css`: all `data-appearance="colorful"` and `data-appearance="custom"` CSS token overrides plus module watercolor selectors.
- Modify `app/globals.css`: import `appearance.css` after the base style files.
- Modify `app/layout.tsx`: extend pre-paint script to apply saved appearance settings while preserving `gailvlun-theme`.
- Create `components/layout/SettingsSection.tsx`: reusable disclosure group for `成绩` and `外观`.
- Modify `components/layout/GlobalSettings.tsx`: use two default-collapsed groups, move detailed scores and appearance controls into disclosures, keep summary visible.
- Modify `components/layout/MobileTopBar.tsx`: hydrate theme store on mobile so quick toggle reflects saved DOM state.
- Add tests:
  - `lib/theme/appearance.test.ts` for pure appearance behavior.
  - `lib/hooks/useTheme.test.tsx` for store/DOM/localStorage behavior.
  - `components/layout/GlobalSettings.test.tsx` for folded sections and appearance controls.

## Task 1: Appearance Model

**Files:**
- Create: `lib/theme/appearance.ts`
- Test: `lib/theme/appearance.test.ts`
- Modify: `lib/hooks/useTheme.ts`
- Test: `lib/hooks/useTheme.test.tsx`

- [ ] Write failing tests for default settings, invalid persisted payload recovery, color validation, font token mapping, colorful mode DOM attributes, custom CSS variables, and legacy `gailvlun-theme` compatibility.
- [ ] Run `node --import tsx --test lib/theme/appearance.test.ts` and `pnpm exec vitest run lib/hooks/useTheme.test.tsx --passWithNoTests`; expect failures.
- [ ] Implement `AppearanceMode = "default" | "colorful" | "custom"`, `GlobalFontId`, defaults, validation, and DOM application.
- [ ] Update `useTheme` to expose appearance setters without breaking existing `setTheme`, `toggle`, and `hydrate` consumers.
- [ ] Rerun targeted tests until green.
- [ ] Commit only the model/store/test files.

## Task 2: CSS Appearance Layer

**Files:**
- Create: `app/styles/appearance.css`
- Modify: `app/globals.css`
- Modify: `components/chat/ArtifactCard.tsx` if a stable class hook is needed.

- [ ] Add CSS variables for selection and crayon highlight so hardcoded orange becomes theme-driven.
- [ ] Add custom mode selectors that remap MD3 primary/secondary/tertiary, aliases, selection, highlight, and font variables from validated runtime CSS vars.
- [ ] Add colorful mode watercolor palettes for light and dark themes, including distinct module tokens for AI answer bubbles, assistant cards, artifact cards, callouts, tables, dialog/window headers, and subject note accents.
- [ ] Keep default mode visually unchanged by making it a no-op.
- [ ] Run a targeted static check with `rg -n "255, 152, 0|crayon-highlight|data-appearance|appearance-" app components lib`.
- [ ] Commit only CSS/component hook files.

## Task 3: Folded Settings UI

**Files:**
- Create: `components/layout/SettingsSection.tsx`
- Modify: `components/layout/GlobalSettings.tsx`
- Modify: `components/layout/MobileTopBar.tsx`
- Test: `components/layout/GlobalSettings.test.tsx`

- [ ] Write failing component tests that assert `成绩` and `外观` details are collapsed by default, expanding `成绩` reveals detailed score data and clear action, expanding `外观` reveals default/colorful/custom controls, and custom color/font controls update the store.
- [ ] Run `pnpm exec vitest run components/layout/GlobalSettings.test.tsx --passWithNoTests`; expect failures.
- [ ] Implement the reusable settings disclosure and refactor `GlobalSettings` around the two groups.
- [ ] Add appearance controls: mode segmented buttons, light/dark/selection color inputs, global font choices, and reset action.
- [ ] Hydrate `useTheme` from `MobileTopBar` to fix the saved-theme mobile toggle edge case discovered during planning.
- [ ] Rerun targeted component tests until green.
- [ ] Commit only settings UI and test files.

## Task 4: Integration Checks

**Files:**
- All files touched above.
- Automation memory: `C:\Users\AIMFl\.codex\automations\automation-4\memory.md`

- [ ] Run `pnpm test:unit` and `pnpm test:react`.
- [ ] Run targeted lint/type gates: `pnpm lint` and `pnpm exec tsc --noEmit`.
- [ ] Run `pnpm check:encoding`.
- [ ] Run a focused U+FFFD scan over changed app/lib/component/style files.
- [ ] Run `pnpm build` if earlier gates are clean and disk/time allow.
- [ ] Commit any final verification-only fixes.
- [ ] Write automation memory with summary, run time, commits, verification, and known pre-existing dirty files.
