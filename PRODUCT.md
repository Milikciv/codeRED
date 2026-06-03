# Product

## Register

product

## Users

**HSA Staff** — Health Sciences Authority analysts and coordinators working in an operations centre context. Their primary job is monitoring national blood stock levels across Singapore's hospital network, detecting shortages before they become critical, responding to hospital requests, and forecasting demand.

**SRC Staff** — Singapore Red Cross field and coordination staff. They manage donor databases, plan and run donation drives, execute donor outreach campaigns, and analyze geographic donor hotspots. They operate under pressure during high-demand periods when HSA raises alerts.

**Admin** — Internal platform administrators responsible for user account management. Low-frequency use; correctness over speed.

## Product Purpose

codeRED is the national blood supply coordination platform for Singapore's Health Sciences Authority. It exists to prevent blood shortages from becoming medical crises — giving HSA staff a single operational view of stock, demand, and alerts, and giving SRC staff the tools to mobilise donors precisely where and when they're needed.

Success means a coordinator can walk into a shift, understand the current national blood supply situation in under 30 seconds, and act on it without friction.

## Brand Personality

Trustworthy, Clear, Calm.

The product handles high-stakes situations (blood shortages, hospital emergencies) but the interface itself should project calm authority, not alarm. Users are professionals under pressure — the tool helps them feel in control, not more anxious. Urgency is communicated deliberately (red status indicators, critical badges) not by the overall visual register.

## Anti-references

**Generic government portals** — avoid cluttered layouts, low-contrast type, dated form aesthetics, excessive borders and dividers, and the visual poverty of legacy e-government platforms. This is a modern operational tool, not a public-sector form.

**Consumer health apps** — avoid soft pastel palettes, rounded friendly iconography, and patient-facing wellness aesthetics. The users are professionals; the tool should feel like a professional instrument.

## Design Principles

1. **Status at a glance.** The most critical information (blood stock health, active alerts, pending requests) must be readable within seconds of landing on any screen. Hierarchy and color carry the load — users do not read; they scan.

2. **Urgency is earned, not ambient.** Red is the brand color and a severity signal. The system uses it deliberately: critical states are visually loud; normal states are quiet. An interface that treats everything as urgent communicates nothing.

3. **Precision over decoration.** Numbers, forecasts, and stock levels must feel authoritative. Visual embellishment that doesn't carry information is a liability — it competes with data and erodes trust.

4. **Role clarity.** HSA, SRC, and Admin have distinct workflows and mental models. The navigation and IA should reflect each role's actual job, not a unified generic shell with everything visible to everyone.

5. **Calm under load.** Loading states, errors, and empty states are first-class design concerns. When data is missing or a request fails, the interface should explain the situation clearly — never leave a professional staring at a blank panel.

## Accessibility & Inclusion

Target: **WCAG 2.1 AA**.

Key considerations:
- All body text and interactive labels must meet 4.5:1 contrast ratio against their background.
- Status indicators (blood stock dots, priority badges) must not rely on color alone — pair with text labels or patterns.
- The platform is used under time pressure; keyboard navigation and focus states must be clearly visible.
- No reliance on motion for conveying critical information; reduced-motion alternatives required for all animations.
