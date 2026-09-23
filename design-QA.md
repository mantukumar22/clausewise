# ClauseWise Design QA Checklist

This checklist verifies that ClauseWise delivers a calm, accessible, and responsive user experience across devices, viewports, languages, and accessibility profiles.

---

## 1. Viewport & Responsive Design Verification

### A. 360px Width (Budget Android phones: e.g. Samsung Galaxy A03, Redmi 9A)

- [x] **No Horizontal Overflow**: Page margins are 12–16px, zero sideways scroll on the body.
- [x] **Bottom Navigation**: Sticky thumb-reachable Bottom Tab Bar displays with 5 items (Home, Summary, Clauses, Ask, More).
- [x] **Document Viewer as Bottom Sheet**: PDF/Document viewer is hidden from split pane and opens as a full-height Bottom Sheet when a citation is tapped.
- [x] **Touch Targets**: All buttons, chips, tabs, and form controls have at least 44x44px touch targets.
- [x] **No Text Truncation in Controls**: Buttons scale padding with label without wrapping awkwardly.

### B. 390px Width (Standard Mobile: e.g. iPhone 13/14/15)

- [x] **Clause Cards**: Collapsed by default showing title, risk badge (icon + label), and one-line consequence.
- [x] **Safe-Area Insets**: Bottom navigation respects `env(safe-area-inset-bottom)` so home indicator bar does not occlude tabs.
- [x] **Input Sticky State in Chat**: Chat input bar stays visible above the soft keyboard.

### C. 768px Width (Tablets & Small Desktops)

- [x] **Two-Column Split**: Switches from single-column mobile view to two-pane layout: Document Viewer on the left (~45%), Analysis Workspace on the right (~55%).
- [x] **Bottom Bar Hidden**: Mobile bottom navigation is hidden; top tab navigation takes over.
- [x] **Citation Synchronized Scrolling**: Clicking any clause scrolls the left document viewer directly to the cited page and highlights the quote with saffron highlight.

### D. 1280px+ Width (Large Desktop Screens)

- [x] **Max-Width Container**: Layout constrained to `max-w-7xl mx-auto` to prevent excessive stretching.
- [x] **Master/Detail Ergonomics**: Generous negative space between panels, smooth text rendering, and clear visual hierarchy.

---

## 2. Light and Dark Theme Verification

- [x] **Light Mode Contrast**:
  - Background: Warm off-white (`#FAF8F5`)
  - Primary text: Deep charcoal (`#1B2430`) passes WCAG AA (>10:1 contrast)
  - Secondary text: Slate (`#5B6572`) passes WCAG AA (>4.5:1)
- [x] **Dark Mode Contrast**:
  - Background: Deep slate-teal (`#0F1715`)
  - Primary text: Soft off-white (`#E8EFED`)
  - Card surfaces: `#16211F` with `#2A3B37` borders
  - Primary button: `#5CC2B8` with dark `#06211E` text (>8:1 contrast)
- [x] **Manual & System Preference**: Toggle in header switches themes smoothly with instant persistence in `localStorage`.

---

## 3. Multilingual Verification (English & Hindi/Devanagari)

- [x] **Devanagari Font Rendering**: Loaded via `Noto_Sans_Devanagari` through `next/font/google`.
- [x] **Line Height in Indian Scripts**: Set to 1.75 for Indian scripts to prevent glyph clipping of matras and ligatures.
- [x] **Language Selector**: Header includes globe icon with current language name; clicking reveals options for English, Hindi (हिंदी), Marathi (मराठी), and other regional languages.
- [x] **Legal Analysis in Target Language**: Gemini prompt explicitly requests translations of summaries, consequences, and talking points in the selected language.

---

## 4. Keyboard-Only Navigation & Assistive Tech

- [x] **Global Keyboard Shortcuts**:
  - `/` focuses the Chat / Ask question input.
  - `J` / `K` navigates between next and previous clauses.
  - `Esc` closes modals, bottom sheets, and menus.
- [x] **Visible Focus Rings**: All interactive elements display a distinct 2px `--focus-ring` (`#2F80ED` in light, `#5CC2B8` in dark).
- [x] **ARIA Roles**:
  - Risk chips include `role="status"` and `aria-label="Risk level: [Label]"`.
  - Bottom sheet dialog includes `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  - Stepper loader includes `role="status"` and `aria-live="polite"`.

---

## 5. Color-Blind Simulation Verification (Deuteranopia, Protanopia, Tritanopia)

- [x] **Zero Reliance on Color Alone**:
  - **High Risk**: Displayed with `AlertOctagon` icon + red-tinted background + bold text label **"Be careful"**.
  - **Medium Risk**: Displayed with `AlertTriangle` icon + amber-tinted background + bold text label **"Check this"**.
  - **Low Risk**: Displayed with `CheckCircle2` icon + green-tinted background + bold text label **"Looks fair"**.
  - **Unverified**: Displayed with `HelpCircle` icon + dashed border + text label **"Couldn't verify quote"**.
- [x] **Result**: A user with complete monochromacy or red-green deficiency can immediately differentiate clause risks by reading the label and recognizing the distinct geometric icons (Octagon vs. Triangle vs. Circle).
