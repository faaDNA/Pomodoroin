---
name: Pomodoroin
description: Calm, offline-first Pomodoro timer on a soft sage light surface, with a mode-tinted ring and ambient glow.
colors:
  ground: "#ecefe9"
  surface: "#f9fbf8"
  surface-elevated: "#ffffff"
  sunk: "#e1e7e0"
  ink: "#1b231f"
  soft: "#5b675f"
  muted: "#8b978e"
  line: "#d8e0d7"
  track: "#d4ded4"
  pine: "#2e5d50"
  pine-soft: "#e3ede8"
  honey: "#8c621d"
  honey-soft: "#f5ece0"
  iris: "#5d5691"
  iris-soft: "#eae8f5"
  danger: "#a44852"
typography:
  display:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  label-compact:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.35
  data:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  full: "9999px"
  stage: "36px"
  panel: "24px"
  field: "17.6px"
spacing:
  "1": "4px"
  "2.5": "10px"
  "3": "12px"
  "3.5": "14px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.surface-elevated}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-short:
    backgroundColor: "{colors.honey}"
    textColor: "{colors.surface-elevated}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-long:
    backgroundColor: "{colors.iris}"
    textColor: "{colors.surface-elevated}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "14px 20px"
  tab:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.soft}"
    typography: "{typography.label-compact}"
    rounded: "{rounded.full}"
    padding: "8px 4px"
  tab-active:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.label-compact}"
    rounded: "{rounded.full}"
    padding: "8px 4px"
  input-duration:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  card-stage:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.stage}"
    padding: "20px"
  card-settings:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

# Design System: Pomodoroin

## Overview

**Creative North Star: "The Quiet Windowsill"**

Pomodoroin is a timer that sits in daylight, not in a dark room. The page is a pale sage ground (#ecefe9) with one soft white stage card floating at its center; a single blurred disc of the active mode's color blooms behind it. Nothing is sharp: every container is pill-round or near-pill, every border is a hairline or a faint ring, every shadow is wide and barely there. The mood is chill minimalism — a plant on a windowsill, a wooden clock, no chrome.

The stage card is the whole product. Inside it, a three-way segmented pill chooses the mode, a 230–260px ring holds the countdown, a row of pill buttons runs it, and an inline panel discloses the duration settings. The world uses color sparingly but *locally*: the active mode tints the ring, the primary button, the segmented thumb, the round dots, and the ambient glow all at once, so the screen reads as one calm temperature rather than a lit dial on a black desk.

Motion is quiet and fast. Everything that responds to a press resolves under 300ms; the only long-running motion is the ambient glow's 5-second breathe while the timer runs. Copy stays Indonesian, controls are named by action, and the layout is one 520px column that never grows navigation or a dashboard.

**Key Characteristics:**
- Light sage ground (#ecefe9) with a white stage card (#f9fbf8) and an ambient blurred glow tinted by the active mode.
- Three botanical accents — pine for focus, honey for short break, iris for long break — applied locally, not globally.
- Everything pill-shaped: 9999px pills and dots, 36px stage, 24px settings panel, 17.6px inputs. No sharp corners anywhere.
- Diffuse, ink-tinted shadows; depth comes from light, not from lines.
- Monospace tabular numerals for the clock and duration inputs; Plus Jakarta Sans for all labels and prose.
- Single centered column (520px), one 640px breakpoint, no persistent navigation.
- All interaction feedback ≤ 300ms; one 5s ambient breathe loop.
- Indonesian UI copy; controls named by action.

## Colors

A light botanical palette: sage neutrals carry the surface, and one of three muted accents carries the current mode.

### Primary

- **Focus Pine** (#2e5d50): The default mode accent and the app's identity color. Fills the focus ring stroke, the primary button while in focus mode, the segmented thumb, the filled round dots, and the ambient glow. Also the universal focus-visible outline (2px) and the caret/selection color in every mode.
- **Pine Wash** (#e3ede8): Soft secondary fill associated with focus (mode `soft` value); available for tinted backgrounds at low emphasis.

### Secondary

- **Break Honey** (#8c621d): Short-break accent. Paints the ring, primary button, segmented thumb, dots, and glow while the short break mode is active. Never used for text on the light ground.
- **Honey Wash** (#f5ece0): Soft tandem for honey surfaces.
- **Long-Break Iris** (#5d5691): Long-break accent, same local application as pine and honey.
- **Iris Wash** (#eae8f5): Soft tandem for iris surfaces.

### Tertiary

- **Alarm Clay** (#a44852): Reserved for error and destructive-action states. Currently unused in the UI — there are none yet.

### Neutral

- **Ground** (#ecefe9): Body background, page padding, and the only surface behind the stage card.
- **Surface** (#f9fbf8): The stage card fill and the fill of the settings trigger pill.
- **Surface Elevated** (#ffffff): The fill of duration inputs — the brightest step, reserved for controls that sit *inside* another card.
- **Sunk** (#e1e7e0): The segmented control track, the secondary button fill, and the settings panel tint (`bg-sunk/50`). One step *below* surface, not above it.
- **Ink** (#1b231f): Clock digits, wordmark, active tab label, primary readings. The shadow tint is derived from it.
- **Soft** (#5b675f): Mode caption, footer text, panel heading, idle tab labels, small helper copy.
- **Muted** (#8b978e): Declared step for the quietest text and hairlines; keep below soft, never use for primary readings.
- **Line** (#d8e0d7): Hairline ring around the header pill, the stage card (`ring-line/80`) and the settings panel (`ring-line/50`); the duration-input ring.
- **Track** (#d4ded4): The ring's unfilled track and the four unfilled round dots. A literal in the SVG and dots, not an `@theme` token — keep it fixed so the track never competes with the mode accent.

### Named Rules

**The Local Tint Rule.** The active mode accent applies as one coherent set — ring stroke, primary button, segmented thumb, filled dots, ambient glow — and changes together when the mode changes. Never mix two mode accents in one view, and never tint the page background or body text.

**The Pine Chrome Rule.** Focus outline, caret, selection, and input focus rings stay pine (#2e5d50) in every mode. Mode color is state; pine is interaction.

**The Light-Fill Rule.** Mode accents are dark-mid tones: any accent fill takes white or surface-elevated text (never ink), and accents are never used as text color on the sage ground.

## Typography

**Display Font:** JetBrains Mono (with monospace fallback)
**Body Font:** Plus Jakarta Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** JetBrains Mono

**Character:** Jakarta Sans gives the UI its soft, contemporary, slightly rounded voice — friendly but not cute. JetBrains Mono appears only where a number changes, so the clock reads as instrumentation inside an otherwise warm surface. No serif, no display face, no letter-spaced kicker, no uppercase micro-label.

### Hierarchy

- **Display** (600, 52px → 60px at `sm`, line-height 1, tracking -0.03em, mono, `tabular-nums`): The countdown only. Digits must not jitter as the 200ms ticker updates.
- **Title** (600, 17px, line-height 1.3, tracking -0.025em): The "Pomodoroin" wordmark.
- **Body** (500, 14px, line-height 1.5): Helper copy and panel context; `text-xs` (12px) for footer and captions.
- **Label** (600, 14px): Primary and secondary buttons — "Mulai" / "Jeda", "Atur ulang", "Suara hidup".
- **Label Compact** (500, 12px → 13px at `sm`): Mode tabs and the settings trigger, with tight leading so two-word Indonesian labels wrap without changing row height.
- **Data** (600, 14px, mono, `tabular-nums`): Duration inputs in the settings panel.

### Named Rules

**The Mono Numerals Rule.** JetBrains Mono is for values that change — the countdown and numeric inputs — and nothing else. Labels, buttons, captions and prose stay in Jakarta Sans. Never set the wordmark or a button in mono.

**The Clock-Is-the-Object Rule.** The clock is the largest type on screen (52px, 60px at `sm`) and is the only element allowed at display size. To make room, remove a control or a caption — never shrink the clock.

**The No-Kicker Rule.** No uppercase, letter-spaced eyebrow, kicker, or section number above any heading. Labels sit at normal case and small size; hierarchy comes from weight and color, not from tracking.

## Layout

One centered stage. `main` is a full-height flex center with 16px horizontal and 32px vertical padding (48px at `sm`), and holds a single column capped at 520px (`max-w-[520px]`), which enters with `rise-in`.

The order is fixed: header row, stage card, footer. Header (17px wordmark left; settings pill right) has 16px bottom margin and 8px inner horizontal padding. The stage card is `rounded-[2.25rem]` (36px) with 20px padding (28px at `sm`), and stacks its contents: segmented control, 24px gap to the ring block (`pt-6`, `sm:pt-8`), ring, 16px gap to the round dots, 28px gap to the control row, then the settings panel 24px below when open. Footer sits 16px under the card with 12px horizontal padding.

The ring is 230px square on mobile and 260px at `sm`, drawn in a 100×100 viewBox with a 44-unit radius and a 5-unit stroke, rotated -90° so progress starts at twelve o'clock. Clock and caption are absolutely centered inside it with 8px between them.

The control row is a 2-column grid with 10px gaps on mobile (primary button spans both columns) and becomes a centered flex-wrap row with 10px gaps at `sm`. The settings grid is one column with 12px gaps, three columns at `sm`.

Spacing follows a 4px base with only the practical steps in use: 4, 10, 12, 14, 16, 20, 24, 28, 32px. There is no grid system, no sidebar, and no breakpoint above 640px — the 520px column simply caps the width.

## Elevation & Depth

Depth is light, not line. The system uses three layers of softness: an ambient blurred glow disc (380px, `blur(100px)`, one side-effect of color), a wide low-opacity card shadow (`0 20px 50px -20px rgba(27,35,31,0.08)`), and micro-shadows (`shadow-xs`) on the segmented thumb, the primary button and the settings pill. Tonal steps still exist — ground → surface → surface-elevated, with sunk below surface for tracks and panels — but they are gentle, not a brightness ladder.

The glow is the only atmospheric element: a single circle pinned to the top centre of the viewport, filled with the active mode accent, held at 35% opacity at rest and breathing between 0.35 and 0.65 scale 0.98→1.04 over 5 seconds while the timer runs. It never becomes a second glow and never sits behind text.

### Shadow Vocabulary

- **Stage lift** (`box-shadow: 0 20px 50px -20px rgba(27,35,31,0.08)`): The stage card only. Ink-tinted, wide, no offset visible at card scale.
- **Micro lift** (`shadow-xs`): Segmented thumb, primary button, settings trigger pill. Signals "this is a control" at 1–2px of softness.
- **Ambient glow** (`filter: blur(100px)`, accent fill, opacity 0.35–0.65): Atmosphere behind the stage; the only colored light in the system.

### Named Rules

**The Soft-Light Rule.** Every shadow is diffuse and ink-tinted. No hard offset shadows, no dark borders-as-shadow, no second colored glow. If an element needs separation, raise it one tonal step or add a `ring-line` hairline — never a hard edge.

**The Breathe-Only-While-Running Rule.** Ambient motion belongs to the running timer. When paused or reset, the glow returns to a static 35% opacity; nothing else in the system loops.

## Shapes

Softness is the form language. Pills everywhere: buttons, mode tabs, the sliding thumb, the settings trigger, the four progress dots, and the ring caps are all fully rounded (`9999px`). Containers step down from there — the stage card at 36px (`2.25rem`), the settings panel at 24px (`1.5rem`), duration inputs at 17.6px (`1.1rem`). There is no 0–8px corner anywhere in the product; a sharp box would read as a different app.

Borders are hairlines or rings, never strokes: 1px `ring-line` at 80% on the card and trigger, 50% on the settings panel, 2px pine at 50% on focused inputs, 2px pine outline on every interactive element. The ring itself is a 5-unit stroke with round caps on the progress arc and a butt-capped track of identical width beneath it; one continuous stroke, never segments.

## Components

### Buttons

- **Shape:** fully rounded pill (9999px), no border, micro shadow, `active:scale-[0.97]`.
- **Primary:** mode accent fill (pine / honey / iris), white label, 14px semibold; 28px × 14px padding, 20px horizontal in the flex row at `sm`. Label reflects state: "Mulai" → "Jeda". Full width across both mobile grid columns.
- **Secondary / Ghost:** sunk fill at 80% (`bg-sunk/80`), ink at 80% opacity, 14px medium; 20px × 14px padding ("Atur ulang"), 16px × 14px for the audible toggle. Hover solidifies to `bg-sunk` + full ink.
- **Settings trigger:** the compact form — surface at 80% with `backdrop-blur-md`, 12px medium, 16px × 6px padding, `ring-line/80`, `shadow-xs`; label toggles "Pengaturan" ↔ "Tutup".
- **Hover / Focus / Active:** all state changes ride `.hover-lift` — 160ms `var(--ease-out)`, 1px upward lift on hover-capable pointers; press feedback is `scale(0.97)`. Focus-visible is a 2px pine outline in every mode.

### Cards / Containers

- **Corner Style:** 36px stage, 24px settings panel.
- **Background:** surface (#f9fbf8) stage on ground (#ecefe9); settings panel is sunk at 50%.
- **Shadow Strategy:** stage lift on the card, `shadow-xs` on controls inside it (see Elevation).
- **Border:** hairline ring — `ring-line/80` on the stage, `ring-line/50` on the panel.
- **Internal Padding:** 20px stage (28px at `sm`), 16px panel (20px at `sm`), 24px between stage content and panel.

### Inputs / Fields

- **Style:** Number inputs only, inside the settings panel: surface-elevated (#ffffff) fill, 17.6px radius, 12px × 10px padding, JetBrains Mono 14px semibold `tabular-nums`, ink text, `ring-line/80` hairline. Label above in 12px medium soft with 4px gap.
- **Focus:** ring thickens to 2px pine at 50% (`ring-pine/50`), shadow transition only — no layout shift.
- **Error / Disabled:** None. Values clamp in code to per-mode min/max (focus 1–90, short 1–30, long 1–60), so invalid states are unrepresentable rather than styled.

### Navigation

No persistent navigation. The only navigational element is the header row: wordmark left, one settings pill right, `justify-between`, 16px bottom margin. The settings surface is inline disclosure (`animate-panel`, 220ms) inside the stage card — never a modal, drawer, or menu.

### Mode Switcher (signature)

A three-column segmented pill: sunk (#e1e7e0) track, 4px padding, 4px gaps, fully rounded. The active state is a **mode-tinted thumb** — filled with the active accent (pine / honey / iris), never white — that slides between segments *and* recolors inside a single transition (`transform, background-color`, 260ms, `var(--ease-in-out)`), so position and color never drift apart. The selected label crossfades to 600 white on that accent (`color`, 160ms `var(--ease-out)`, deliberately faster than the slide: a long label fade leaves unreadable white-on-sunk frames). Idle labels sit at soft and darken on hover. Labels are 12px/500, stepping to 13px at `sm`; mobile shows the short forms ("Fokus", "Singkat", "Panjang"), `sm` and up the full ones ("Istirahat Singkat", "Istirahat Panjang"). Row height is held by padding, not by `nowrap`.

### Cycle Ring (signature)

An SVG ring 230–260px with a 5-unit stroke, radius 44, rotated -90°. The track is #d4ded4; the progress arc is the active mode accent with round caps, shrinking clockwise as time elapses (`stroke-dashoffset` 200ms linear, `stroke` 500ms `var(--ease-out)` on mode change). The clock sits inside at 52/60px mono semibold, with a 12px soft caption below reading the mode name. Four 6px dots under the ring show progress toward the long break (filled with the mode accent, unfilled #d4ded4, 300ms color transition) beside a 12px soft "putaran n" label. Do not add tick marks, gradients, or a second nested ring.

### Footer

One line of 12px soft text, left-aligned: total focus minutes in prose form followed by the session count — e.g. `50 menit fokus · 2 sesi`, `1 jam 15 menit fokus · 3 sesi`. No status indicators or colour: the backend is an implementation detail, never shown to the user. Wrapped as a single line so it can't break; the colon-separated groups are part of one sentence.

## Do's and Don'ts

### Do:

- **Do** keep the app to one centered 520px column: header, stage card, footer, nothing else.
- **Do** apply the active mode accent locally and together — ring, primary button, segmented thumb, dots, ambient glow — and keep focus outlines and input focus rings pine in every mode.
- **Do** use white or surface-elevated text on mode-accent fills, and ink text on light surfaces.
- **Do** keep every corner pill-round or near-pill: 9999px controls, 36px stage, 24px panel, 17.6px inputs.
- **Do** use JetBrains Mono `tabular-nums` for the clock and numeric inputs only.
- **Do** keep interaction feedback ≤ 160ms via `.hover-lift` (160ms `var(--ease-out)`) and `active:scale-[0.97]`, with every state change under 300ms.
- **Do** respect `prefers-reduced-motion`: no breathe, no rise, no panel slide, no hover lift, near-zero transitions.
- **Do** keep all UI copy in Indonesian and label buttons by action ("Mulai", "Atur ulang", "Tutup").

### Don't:

- **Don't** introduce sharp corners, square borders, or 0–8px radii anywhere.
- **Don't** add a second colored glow, a dark shadow, or a hard offset shadow; depth is wide, low-opacity ink.
- **Don't** mix mode accents in one view, or tint the page background, body text, or chrome with the mode color.
- **Don't** use the accent colors as text on the light ground, or ink on accent fills.
- **Don't** add animation longer than 300ms other than the 5s ambient breathe — no entrance repeats, no continuous decoration.
- **Don't** set labels, buttons, or the wordmark in mono; don't shrink the clock below 52px to fit new content.
- **Don't** add uppercase letter-spaced kickers, glyph icons, or a dashboard/statistics shell around the timer.
