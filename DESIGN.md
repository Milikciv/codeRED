---
name: codeRED
description: National blood supply coordination platform for Singapore's Health Sciences Authority
colors:
  alert-crimson: "#C20000"
  alert-crimson-deep: "#A10000"
  alert-crimson-darkest: "#800000"
  alert-crimson-muted: "#FFB3B3"
  alert-crimson-faint: "#FFDADA"
  alert-crimson-ghost: "#FFF5F5"
  surface-body: "#F9FAFB"
  surface-card: "#FFFFFF"
  border-default: "#F3F4F6"
  border-subtle: "#E5E7EB"
  ink-primary: "#1F2937"
  ink-secondary: "#4B5563"
  ink-muted: "#6B7280"
  status-amber: "#FEAE25"
  status-amber-light: "#FFFADA"
  status-green: "#63A363"
  status-green-light: "#EBF5EB"
  status-blue: "#0088FF"
  status-blue-light: "#E6F3FF"
typography:
  headline:
    fontFamily: "Funnel Sans, Inter, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Funnel Sans, Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Funnel Sans, Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Funnel Sans, Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.alert-crimson}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.alert-crimson-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-outline-hover:
    backgroundColor: "{colors.surface-body}"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
  badge-critical:
    backgroundColor: "#FEE2E2"
    textColor: "#B91C1C"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-high:
    backgroundColor: "#FFEDD5"
    textColor: "#C2410C"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-medium:
    backgroundColor: "#FEF9C3"
    textColor: "#A16207"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-low:
    backgroundColor: "#DCFCE7"
    textColor: "#15803D"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: codeRED

## 1. Overview

**Creative North Star: "The Field Coordinator"**

codeRED is a tool built for people in motion: coordinators, analysts, and field staff who carry the weight of national blood supply decisions. The visual system reflects their reality — minimal friction, maximum clarity, and a calm authority that does not add noise to an already demanding job. Nothing decorates. Every element earns its position by doing work.

The palette is deliberately restrained. Alert Crimson (`#C20000`) is a brand anchor and a severity signal, not a decoration. It appears on primary actions, active navigation states, and critical status indicators. Its rarity is the point: when something is red, users know it means something. The rest of the surface is neutral and recessive — white cards on a light gray body, muted ink for secondary text. The interface stays out of its own way.

Density is appropriate to the task. Coordinators scan dashboards packed with data; the type scale and spacing are tuned for information-rich layouts. Compactness is a feature, not a compromise. But compactness never means illegibility: contrast ratios meet WCAG 2.1 AA throughout, and every status indicator is paired with a text label so color is never the only channel.

This system explicitly rejects the aesthetic of generic government portals (cluttered, low-contrast, dated form layouts, excessive bordered dividers) and consumer health apps (soft pastels, rounded-friendly typefaces, patient-facing wellness tone). codeRED is a professional instrument. It should feel like one.

**Key Characteristics:**
- Single-family type system (Funnel Sans) with weight-driven hierarchy — no display face
- Alert Crimson used on ≤10% of any given screen
- Flat surfaces at rest; depth emerges only through interaction layer (modal, toast, dropdown)
- Complete semantic status vocabulary (amber, green, blue, red) used consistently across all alert, badge, and indicator surfaces
- Status indicators always paired with text labels — color is never the only channel

## 2. Colors: The Alert Crimson Palette

A restrained palette: one saturated accent, a full neutral stack, and a semantic status tier that maps precisely to operational severity.

### Primary
- **Alert Crimson** (#C20000): The primary action color, active navigation state, and critical severity indicator. Used on primary buttons, active sidebar links, link text, and the banner accent rule. Its presence signals either an interaction affordance or elevated urgency. Never used as a large surface fill.
- **Alert Crimson Deep** (#A10000): Hover and pressed state for primary buttons. Not used independently as a standalone color.
- **Alert Crimson Darkest** (#800000): Active/pressed state at the deepest tier. Not used independently.
- **Alert Crimson Faint** (#FFDADA): Icon container backgrounds on stat cards with critical context (the red-tinted icon wells).
- **Alert Crimson Ghost** (#FFF5F5): Active nav item background fill. The surface tint that pairs with crimson text in the sidebar.

### Neutral
- **Body** (#F9FAFB): Page canvas beneath all cards and panels.
- **Card** (#FFFFFF): All card, panel, and form surfaces.
- **Border Default** (#F3F4F6): Card borders, row separators, and the faintest structural markers.
- **Border Subtle** (#E5E7EB): Input field borders, stronger dividers, dropdown outlines.
- **Ink Primary** (#1F2937): Body text, heading text, data values, all text needing full legibility.
- **Ink Secondary** (#4B5563): Supporting content, column headers, secondary descriptions.
- **Ink Muted** (#6B7280): Timestamps, metadata, placeholder text, footnotes. Must still hit 4.5:1 against white — verify before softening further.

### Secondary (Semantic Status)
- **Amber** (#FEAE25): Warning alerts, units expiring soon, medium-priority indicators. Always paired with Amber Light (#FFFADA) as the background.
- **Green** (#63A363): Adequate blood stock, low-priority indicators, success states. Always paired with Green Light (#EBF5EB).
- **Blue** (#0088FF): Informational notifications, non-urgent callouts. Paired with Blue Light (#E6F3FF).

### Named Rules
**The Alert Crimson Rule.** Alert Crimson (#C20000) appears on ≤10% of any given screen. It is the accent, not the canvas. Every use is either a primary action, an active state, or a critical severity signal. Using it for decoration is a mistake.

**The Tint Pairing Rule.** Every semantic status color (amber, green, blue, red) has a light tint counterpart. Status surfaces always use the light tint as background and the saturated color for icons, text, and borders. Never full-saturation status backgrounds on large surfaces.

## 3. Typography

**Body / All-Purpose Font:** Funnel Sans (with Inter, system-ui, sans-serif fallbacks)

**Character:** A single humanist sans-serif carries the entire hierarchy. Weight contrast (400 regular → 600 semibold → 700 bold) does the differentiation work. No display typeface is needed or welcome. At the compact sizes product UI demands, Funnel Sans reads cleanly without the stiffness of geometric defaults or the busyness of a two-family system.

### Hierarchy
- **Headline** (700, 36px, 1.2 line-height, -0.01em letter-spacing): Page banner titles only. These overlay the banner image and name the current screen. Not used inside content panels.
- **Stat Value** (700, 24px, 1.2 line-height): Numeric KPIs in stat cards. The only large type that appears inside the content area.
- **Title** (600, 15px, 1.4 line-height): Section headings inside cards and panels, table column group labels.
- **Body** (400, 15px, 1.5 line-height): Alert messages, request descriptions, any prose. Keep to 65–75ch max-width in reading contexts.
- **Label** (500, 13px, 1.25 line-height): Tags, form labels, table column headers, badge text, metadata, breadcrumbs.

### Named Rules
**The Weight-Contrast Rule.** Hierarchy is expressed through weight, not size alone. A title and body text may share the same 15px size; 600 vs 400 weight is sufficient differentiation for dashboard contexts. Size differentiation kicks in at the stat value tier (24px) and the banner headline (36px) only.

**The One-Family Rule.** Funnel Sans is the only typeface in this system. No decorative display face on dashboard surfaces. This is a tool, and its type should disappear into the task.

## 4. Elevation

codeRED uses flat-first elevation. All resting data surfaces sit at the same visual plane. Depth is not ambient — it is earned by layer position.

### Shadow Vocabulary
- **Flat** (no shadow): All data cards, section panels, table containers, and list rows at rest. The white card background is sufficient contrast against the gray-50 body; no shadow is needed.
- **Ambient Low** (`box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)`): The baseline interactive shadow. Used on the user chip and any card that is explicitly interactive (not just data-bearing).
- **Overlay** (`box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)`): Modals and dialog boxes. Communicates that the element floats above the full page layer.
- **Floating** (`box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)`): Toast notifications, dropdown menus, the user chip on hover. Lighter than overlay because these are transient surfaces.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow appears only when an element lifts above the content plane to float (modal, toast, dropdown) or when an element gains interactive lift on hover (user chip). A card that bears data but is not interactive has no shadow.

## 5. Components

### Buttons
Compact and purposeful. Labels are always verb + object ("Save changes", "Respond to request", "Dismiss alert"). Never "OK", "Yes", or "Confirm" without a subject.

- **Shape:** Gently rounded (8px radius)
- **Primary:** Alert Crimson (#C20000) background, white text, 8px top/bottom / 16px left/right padding. Hover: Alert Crimson Deep (#A10000). Transition: `background-color 150ms ease-out`.
- **Outline:** Transparent background, Border Subtle (#E5E7EB) border, Ink Secondary (#4B5563) text. Hover: Body (#F9FAFB) background. Cancel and secondary actions only.
- **Inline text link:** Alert Crimson text, no border, hover underline. Used inside cards for "View all" / "View details" shortcuts.

### Cards / Containers
The primary grouping surface for related content.

- **Corner Style:** Rounded (12px radius)
- **Background:** Card white (#FFFFFF)
- **Shadow Strategy:** Flat at rest per the Flat-By-Default Rule
- **Border:** Border Default (#F3F4F6), 1px solid
- **Internal Padding:** 16px standard; 12px for dense subsidiary panels

### Priority Badges
Compact severity labels. Always sentence-case text. Color and text are both present — no badge relies on color alone.

- **Critical:** #FEE2E2 background, #B91C1C text
- **High:** #FFEDD5 background, #C2410C text
- **Medium:** #FEF9C3 background, #A16207 text
- **Low:** #DCFCE7 background, #15803D text
- All variants: 13px, semibold (600), rounded-full pill, 2px/8px padding

### Blood Stock Dots (Signature Component)
12×12px filled circles in the hospital × blood-type matrix, communicating stock level at a glance across 48 cells.

- **Good (70–100%):** Green (#22C55E)
- **Low (40–69%):** Amber (#FACC15)
- **Critical (0–39%):** Red (#EF4444)
- **No Data:** Gray (#D1D5DB)

The legend row beneath the table is non-optional and non-removable. These dots must always have adjacent text label identifiers — color alone is insufficient for accessibility.

### Inputs / Fields
- **Style:** White background, Border Subtle (#E5E7EB) border, 8px radius
- **Focus:** Alert Crimson border, faint ring (`ring-1 ring-[#C20000]/20`)
- **Placeholder:** Ink Muted (#6B7280) — must maintain 4.5:1 contrast against white
- **Disabled:** Body background (#F9FAFB), muted border

### Navigation (Sidebar)
Collapsible left sidebar (208px expanded, 56px icon-only).

- **Active item:** Alert Crimson Ghost (#FFF5F5) background, Alert Crimson (#C20000) text and icon
- **Default item:** Ink Secondary (#4B5563) text, transparent background
- **Hover item:** Body (#F9FAFB) background, Ink Primary (#1F2937) text
- **Typography:** 15px, medium (500)
- **Alert badges:** Alert Crimson (#C20000) pill, white text. Used only for unread counts; never for decoration.

### Alert Card (Signature Component)
The primary alerting surface for blood supply notifications. Always contains a priority badge, icon, title, and message body. Dismissible via an X button. Three severity tiers:

- **Critical:** #FEF2F2 background, #FECACA border
- **High:** #FFF7ED background, #FED7AA border
- **Medium:** #FEFCE8 background, #FEF08A border

### Toast / Notifications
Fixed top-right, white background with a colored-border treatment (full border, tinted — not a side stripe). Auto-dismiss at 4 seconds. Four types: success (green), warning (amber), error (red), info (blue).

## 6. Do's and Don'ts

### Do:
- **Do** use Alert Crimson (#C20000) exclusively for primary actions, active states, and critical severity. Its scarcity is what makes it meaningful on a screen full of blood supply data.
- **Do** pair every color-coded status indicator with a text label. Blood stock dots, priority badges, and alert tiers must always have text identification alongside. Color alone fails users with color vision deficiencies.
- **Do** keep body text at Ink Primary (#1F2937) on card surfaces. Using Ink Muted (#6B7280) for body copy "for elegance" fails WCAG AA contrast and is illegible under operational pressure.
- **Do** use the semantic status color vocabulary (crimson, amber, green, blue) consistently across all surfaces. An amber badge and an amber alert card and an amber toast all use the same #FEAE25 and #FFFADA. No per-screen improvisation.
- **Do** write button labels as verb + object: "Respond to request", "Dismiss alert", "View all requests", "Save changes". Never standalone "OK", "Yes", or "Confirm".
- **Do** use skeleton loading states instead of center-screen spinners inside data panels. The page-level LoadingScreen pattern already exists; use skeleton shapes to replace card contents during in-panel loads.
- **Do** assign shadow weight according to layer position: flat for data cards, ambient low for interactive elements, overlay for modals, floating for toasts and dropdowns.

### Don't:
- **Don't** use Alert Crimson as a background color on any surface larger than a badge pill. It is an accent, not a canvas.
- **Don't** design for a generic government portal aesthetic: cluttered layouts, low-contrast type, excessive borders used as section dividers, dated form layouts. This is a modern operational tool, not an e-government form.
- **Don't** adopt consumer health app aesthetics: soft pastel palettes, rounded-friendly type, patient-facing wellness tone. The users are professionals; the tool should feel like a professional instrument.
- **Don't** use gradient text (`background-clip: text` with a gradient `background`). Alert Crimson at full weight as a solid color carries more authority than any gradient.
- **Don't** use a colored `border-left` or `border-right` greater than 1px as an accent stripe on cards, list items, or alert surfaces. Use full borders with tinted backgrounds instead (as AlertCard already does correctly).
- **Don't** add decorative motion. All animation in this system conveys state: loading, entry, dismiss, hover feedback. Choreographed page-load sequences, parallax, and staggered entrance animations have no place in a tool users depend on under pressure.
- **Don't** invent a new status color outside the four semantic roles (crimson, amber, green, blue). Map new status needs to the closest existing tier.
- **Don't** use the 36px headline size inside content panels. Banner headlines name the screen. Inside a card, 15px title and 24px stat value are the ceiling.
