# ClauseWise UI Token System & Design Rules

This document outlines the design tokens, color palette, risk indicators, and typography standards defined for **ClauseWise**, adhering to calm, trustworthy, and accessible legal assistance principles.

---

## 1. Core Color System

Tokens are defined as CSS custom properties in `/app/globals.css` and exposed via Tailwind CSS v4 `@theme` mappings. Never hardcode arbitrary hex values in components.

### Light Theme (Default)

| Token                  | Hex Value | Usage / Semantic Role                                        |
| :--------------------- | :-------- | :----------------------------------------------------------- |
| `--background`         | `#FAF8F5` | Warm off-white canvas, calming and easy on the eyes          |
| `--surface`            | `#FFFFFF` | Primary cards, modals, sheets, and elevated containers       |
| `--surface-muted`      | `#F3F0EA` | Neutral secondary containers, quote backgrounds, chip tracks |
| `--border`             | `#E4DFD6` | Subtle 1px structural container and card borders             |
| `--text`               | `#1B2430` | High-contrast primary body text (WCAG AA compliant)          |
| `--text-muted`         | `#5B6572` | Secondary labels, descriptions, and timestamps               |
| `--primary`            | `#1F5F5B` | Deep calming teal for primary action buttons, active states  |
| `--primary-foreground` | `#FFFFFF` | Text inside primary buttons and active indicators            |
| `--primary-soft`       | `#E3F1EF` | Soft teal tint for selected cards, badges, and focus zones   |
| `--highlight`          | `#FFF1C2` | Soft saffron-yellow for verbatim quote highlights            |
| `--focus-ring`         | `#2F80ED` | Accessible 2px focus ring for keyboard navigation            |

### Dark Theme

| Token                  | Hex Value | Usage / Semantic Role                               |
| :--------------------- | :-------- | :-------------------------------------------------- |
| `--background`         | `#0F1715` | Deep dark slate-teal canvas                         |
| `--surface`            | `#16211F` | Elevated dark surfaces and cards                    |
| `--surface-muted`      | `#1D2A27` | Secondary dark containers                           |
| `--border`             | `#2A3B37` | Subtle dark container borders                       |
| `--text`               | `#E8EFED` | Crisp light text with high legibility               |
| `--text-muted`         | `#9DB0AB` | Muted secondary text in dark mode                   |
| `--primary`            | `#5CC2B8` | Luminous seafoam teal for buttons and active states |
| `--primary-foreground` | `#06211E` | High-contrast dark text on primary elements         |
| `--highlight`          | `#3E3718` | Dark saffron highlight for document viewer quotes   |

---

## 2. Risk Color System (Color + Icon + Text Label Rule)

**Mandatory Rule**: Risk states **NEVER** rely on color alone. Every risk indicator must combine:

1. Distinct Background, Foreground, and Border colors
2. An unambiguous Lucide icon
3. A plain-language text label at an 8th-grade reading level

| Risk Level     | Light BG / FG / Border            | Dark BG / FG / Border             | Icon            | Label                     | Meaning                                        |
| :------------- | :-------------------------------- | :-------------------------------- | :-------------- | :------------------------ | :--------------------------------------------- |
| **Low**        | `#E6F4EA` / `#1E6B3A` / `#B7DFC3` | `#14301F` / `#7FD69A` / `#1D4C30` | `CheckCircle2`  | **Looks fair**            | Standard clause with balanced obligations      |
| **Medium**     | `#FFF3D6` / `#8A5A00` / `#F0D48A` | `#3A2C08` / `#F2C25B` / `#5A430E` | `AlertTriangle` | **Check this**            | Non-standard, ambiguous, or negotiable term    |
| **High**       | `#FDE8E6` / `#B42318` / `#F4B8B2` | `#3C1512` / `#FF9C92` / `#66201B` | `AlertOctagon`  | **Be careful**            | Unilateral power, forfeiture, or heavy penalty |
| **Unverified** | `#F3F4F6` / `#6B7280` / `#D1D5DB` | `#1A2421` / `#8E9F9B` / `#2A3B37` | `HelpCircle`    | **Couldn't verify quote** | Excerpt could not be verified in source text   |

_Risk colors are strictly reserved for risk indicators and never applied to generic UI decorations._

---

## 3. Typography & Microcopy Rules

- **Display & Latin Text**: `Inter` via `next/font/google`.
- **Indian Scripts**: `Noto Sans Devanagari` (Hindi, Marathi) + regional font subsets.
- **Contract Text (`.contract-quote`)**: Distinct monospace/serif styling with 3px left border in `--primary` on `--surface-muted` background to delineate original document excerpts from AI commentary.
- **Base Font Size**: Minimum 16px to prevent iOS auto-zoom on input elements.
- **Microcopy**: Conversational, non-alarming, and direct (use "you" and "your"). Avoid legal jargon (use "Be careful" instead of "Indemnity Exposure", "Looks fair" instead of "Statutorily Standard").

---

## 4. Spacing, Shapes, and Touch Targets

- **Spacing Grid**: 8px rhythmic grid (8px, 16px, 24px, 32px).
- **Cards**: 16px border-radius (`rounded-2xl`), 1px border, soft shadow.
- **Buttons**: 12px border-radius (`rounded-xl`), minimum 48px height on mobile.
- **Touch Targets**: Minimum 44x44px for all buttons, tabs, and interactive chips.
- **Transitions**: Subtle 150–200ms ease-out, respecting `prefers-reduced-motion`.
