---
name: Podomoroin
description: Minimalist, offline-first Pomodoro timer with a mode-colored countdown ring.
colors:
  ground: "#020617"
  panel: "#0f172a"
  border: "#1e293b"
  control-border: "#334155"
  control-hover: "#64748b"
  text: "#f1f5f9"
  text-secondary: "#e2e8f0"
  text-ui: "#cbd5e1"
  text-quiet: "#94a3b8"
  accent-sky: "#38bdf8"
  accent-green: "#4ade80"
  accent-violet: "#c084fc"
  action: "#10b981"
  action-hover: "#34d399"
  danger: "#fb7185"
typography:
  display:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  label-compact:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.25
  data:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  lg: "8px"
  2xl: "16px"
  full: "9999px"
spacing:
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "7": "28px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.ground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
    textColor: "{colors.ground}"
    rounded: "{rounded.lg}"
  button-secondary:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  tab:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-ui}"
    typography: "{typography.label-compact}"
    rounded: "{rounded.lg}"
    padding: "8px 4px"
  tab-active:
    backgroundColor: "{colors.accent-sky}"
    textColor: "{colors.ground}"
    typography: "{typography.label-compact}"
    rounded: "{rounded.lg}"
    padding: "8px 4px"
  input-duration:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.text}"
    typography: "{typography.data}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  card-settings:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.2xl}"
    padding: "20px"
---

# Design System: Podomoroin

## Overview

**Creative North Star: "The Desk Timer"**

Podomoroin looks like a single piece of hardware dropped on a dark desk: one dial, one number, one button that starts it. The screen holds a 672px column at the center of the viewport and nothing else — no navigation chrome, no statistics dashboard, no motivational copy wrapped around the clock. Silence is the primary visual material; the clock is the only object with weight.

The world is the category-standard dark operative surface, executed with restraint: a near-black slate ground, one-pixel slate borders instead of shadows, and a single accent that shifts with the timer mode. Chrome (brand mark, active tab, focus outline) is always sky; the mode accents — sky for focus, green for short break, violet for long break — are reserved for the progress ring so the ring alone announces state.

Density is low and predictable: three mode tabs, a 240–288px ring, a row of at most three controls, a hairline footer, and an optional settings panel that appears in place rather than in a modal. Nothing animates except the ring's dash offset and 150ms color transitions on interactive state.

**Key Characteristics:**
- Near-black slate ground with tonal panel layering, zero shadows.
- One accent per timer mode; chrome accent stays sky in every mode.
- Monospace tabular numerals for every changing value.
- 8px radius on all controls, 16px on the settings panel, 1px borders.
- Single centered column (max 672px), no persistent navigation.
- Indonesian UI copy; controls named by action, not by feature.
- Mobile-first sizing with one breakpoint at 640px.

## Colors

A cool slate scale carries the entire surface; accents appear only where the timer state is being expressed.

### Primary

- **Focus Sky** (#38bdf8): The identity and interaction accent. Fills the "P" brand mark and the active mode tab, paints the focus-mode ring, and serves as the universal focus-visible outline (2px) and caret/selection color. Also the default mode's ring stroke.
- **Action Emerald** (#10b981): The only filled action button ("Mulai" / "Jeda"). Hover lightens it to (#34d399), which is also the color of the "backend connected" status dot.

### Secondary

- **Break Green** (#4ade80): Short-break ring stroke only. Never used for text or chrome.
- **Long-Break Violet** (#c084fc): Long-break ring stroke only.

### Tertiary

- **Alarm Rose** (#fb7185): The "backend offline" status dot, and nothing else. It is not an error-state color for forms or buttons, which have no error styling.

### Neutral

- **Ground** (#020617): Body background and the fill of duration inputs. The darkest step; everything sits on it.
- **Panel** (#0f172a): Idle mode tabs and the settings panel. One tonal step above ground.
- **Hover Fill** (#1e293b): Background of hovered buttons and tabs, settings-panel border, footer divider rule, and the ring's unfilled track. The third tonal step.
- **Control Border** (#334155): 1px border on every secondary control and duration input; scrollbar thumb.
- **Hover Border** (#64748b): Border on hovered secondary buttons, and the fill of the "checking backend" dot.
- **Primary Text** (#f1f5f9): Clock digits, wordmark, settings heading, input values.
- **Secondary Text** (#e2e8f0): Label text inside secondary buttons.
- **UI Text** (#cbd5e1): Idle mode-tab labels and the "Pengaturan" trigger.
- **Quiet Text** (#94a3b8): Mode caption under the clock, footer text, duration-input labels, helper copy.

### Named Rules

**The One Accent Rule.** Exactly one accent is painted per element. Accents never stack: an active tab is sky with ground text, a primary button is emerald with ground text, and a ring is a single mode color. The mode accent lives only in the ring; use sky for chrome regardless of mode.

**The Ground-Text Rule.** Every accent fill takes ground (#020617) as its text color. White on sky or emerald is a contrast failure and never appears.

## Typography

**Display Font:** Geist Mono (with ui-monospace, SFMono-Regular fallbacks)
**Body Font:** Geist (with system-ui, sans-serif fallbacks)
**Label/Mono Font:** Geist Mono

**Character:** Geist keeps labels compact and modern without personality; Geist Mono earns its place only where digits change. The pairing reads as instrumentation, not editorial: no serif, no display face, no letter-spaced kicker.

### Hierarchy

- **Display** (700, 48px/60px responsive to 60px at `sm`, line-height 1, tracking -0.025em): The countdown only. `tabular-nums` so digits do not jitter as the timer ticks.
- **Title** (600, 18px, line-height 1.4, tracking -0.025em): The "Podomoroin" wordmark; the brand mark "P" is 18px/700 in the same size.
- **Body** (400, 16px, line-height 1.5): Settings heading context, input values.
- **Label** (600, 14px, line-height 1.4, growing to 16px at `sm`): Buttons — "Mulai", "Atur ulang", "Suara hidup", "Pengaturan".
- **Label Compact** (500, 13px, line-height 1.25, growing to 14px at `sm`): The three mode tabs. Tight leading so the two-word Indonesian labels wrap without changing row height.
- **Data** (400, 16px, mono, tabular): Duration inputs in the settings panel.

### Named Rules

**The Mono Numerals Rule.** Geist Mono is used for values that change — the countdown and numeric inputs — and for nothing else. Labels, buttons and prose stay in Geist. Never set the wordmark or a button in mono for flavor.

**The 48-Not-40 Rule.** The clock is the largest type on the screen by a wide margin (48px mobile, 60px at `sm`). Do not shrink it to make room for added panels; remove the panel instead.

## Layout

A single centered column: `main` fills at least the viewport height and centers its child, which is 100% wide up to 672px and padded 16px horizontally / 32px vertically. The column stacks with 32px rhythm between header, mode tabs, timer section, footer, and settings panel.

Within the timer section, the ring and the control row are separated by 28px. The mode selector is a strict three-column grid with 8px gaps, so each tab is one third of the column. The settings panel switches from one column to three (`sm`, 640px) with 16px gaps. The control row is flex-wrapped with 10px gaps (12px at `sm`) and centers when the viewport forces a wrap.

The ring is 240px square on mobile and 288px at `sm`; it is drawn in a 100×100 viewBox with a 45-unit radius and a 4-unit stroke, rotated -90° so progress starts at twelve o'clock. The clock and caption are absolutely centered inside the ring with 8px between them.

Spacing follows a 4px base with only the practical steps in use (6/8/10/12/16/20/28/32px). There is no container grid, no sidebar, and no breakpoint above 640px — the 672px column simply caps the width.

## Elevation & Depth

No shadows anywhere. Depth is tonal and linear: ground (#020617) → panel/idle fill (#0f172a) → hover fill and dividers (#1e293b), each step separated by a 1px border rather than by blur or lift. The settings panel is the only raised container; it uses the panel tone plus a 16px radius and a slate-800 border to separate from the ground.

### Named Rules

**The Flat Desk Rule.** Surfaces are flat at rest and at hover. If an element needs to look separable, move it one tonal step or give it a 1px border — never add `box-shadow`, gradient, or glow. The ring's colored stroke is the only luminous element in the system.

## Shapes

Rectangular controls with softly cut corners: every button, tab, input and the brand mark use an 8px radius. The settings panel is the single 16px-radius surface, which reads as a container rather than a control. Status dots are perfect 8px circles (`border-radius: 9999px`). Borders are always 1px, never 2px, except the focus outline, which is 2px and sits on the element edge.

The countdown ring is a circle with round line caps on the progress arc and a butt-capped track beneath it; the arc's dash length is the entire circumference, offset by progress, so the shape is always one continuous stroke rather than segments.

## Components

### Buttons

- **Shape:** 8px radius, no shadow, 1px border only on secondary variants.
- **Primary:** Emerald (#10b981) fill, ground (#020617) text, 14px/600 label growing to 16px at `sm`; padding 10px 16px on mobile, 12px 24px at `sm`. Label reflects state: "Mulai" → "Jeda".
- **Hover / Focus:** Background lightens to (#34d399) on hover. Focus-visible adds a 2px emerald-300 outline. Transition covers color/background/border in 150ms.
- **Secondary / Ghost:** Transparent-to-ground fill with a 1px (#334155) border and (#e2e8f0) text; hover raises the border to (#64748b) and the fill to (#1e293b). The settings trigger is the compact form of this button (12px 6px padding, 14px text); the mute toggle and "Atur ulang" are the standard form.

### Chips

Not used. Mode selection is a tab row, not a chip set; do not introduce pill chips into this system.

### Cards / Containers

- **Corner Style:** 16px on the settings panel; 8px on everything else.
- **Background:** #0f172a panel, flat against #020617 ground.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px #1e293b on the settings panel; 1px #334155 on inputs and secondary buttons.
- **Internal Padding:** 20px panel padding, 16px between the settings grid and the helper line.

### Inputs / Fields

- **Style:** Number inputs only, in the settings panel: #020617 fill (ground, darker than its panel), 1px #334155 border, 8px radius, 8px 12px padding, Geist Mono tabular numerals at 16px, #f1f5f9 text, 14px #94a3b8 label sitting 6px above.
- **Focus:** Border turns sky (#38bdf8) and a 2px sky-400 outline appears; hover raises the border to #334155 → #45556c one step earlier in the ramp.
- **Error / Disabled:** None. Values are clamped in code to per-mode min/max (focus 1–90, short 1–30, long 1–60), so invalid states are unrepresentable rather than styled.

### Navigation

There is no persistent navigation. The only navigational element is the header row: brand mark + wordmark on the left, a single "Pengaturan" toggle on the right, 16px gaps, wrapping on narrow screens. It never becomes a menu; the settings surface is inline disclosure, not a drawer or modal.

### Mode Tabs (signature)

A three-column grid that doubles as the app's state selector. Idle tabs are #0f172a with #cbd5e1 text; the active tab is a solid sky (#38bdf8) fill with ground text. Text is 13px/500 with tight leading, stepping to 14px at `sm`. Labels stay in Indonesian and may wrap to two lines ("Istirahat Panjang"); row height is held by the fixed vertical padding, not by nowrap.

### Cycle Ring (signature)

An SVG ring, 240–288px, with a 4-unit stroke. Track is #1e293b; the progress arc is the mode color — sky #38bdf8 for focus, green #4ade80 for short break, violet #c084fc for long break — with round caps, starting at twelve o'clock and shrinking clockwise as time elapses (dash offset transitions 200ms linear). The clock sits inside it in mono 48/60px with a 14px quiet caption reading "mode · putaran n". Do not add tick marks, gradients, or a second nested ring.

## Do's and Don'ts

### Do:

- **Do** keep the whole app in one centered column capped at 672px; new content joins the existing vertical rhythm (32px between blocks).
- **Do** express a new timer mode with a new ring accent and nothing else — chrome stays sky.
- **Do** use ground (#020617) text on every accent fill, and a 2px focus-visible outline on every interactive element.
- **Do** use 8px radius for controls and 16px only for the settings panel.
- **Do** use Geist Mono `tabular-nums` for any number that changes on screen.
- **Do** keep all UI copy in Indonesian and label buttons by action ("Mulai", "Atur ulang", "Tutup pengaturan").

### Don't:

- **Don't** add shadows, gradients, glows, or glass/blur surfaces; depth is tonal plus 1px borders.
- **Don't** add a second accent to an element, or paint the active tab in the mode color.
- **Don't** introduce new radius values (no fully rounded buttons, no sharp squares) or 2px borders.
- **Don't** wrap the clock in motivational copy, statistics, or a dashboard shell — the screen holds the timer and its immediate controls only.
- **Don't** replace monospace numerals with the body face, or use mono for labels.
- **Don't** add animation beyond the ring's dash offset and 150ms color transitions.
