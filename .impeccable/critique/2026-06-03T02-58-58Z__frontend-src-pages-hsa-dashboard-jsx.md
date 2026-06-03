---
target: frontend/src/pages/hsa/Dashboard.jsx
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-06-03T02-58-58Z
slug: frontend-src-pages-hsa-dashboard-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton loading is well-done; no in-flight feedback on alert dismissal |
| 2 | Match System / Real World | 3 | Domain language and icon metaphors appropriate for hospital staff |
| 3 | User Control and Freedom | 3 | Dismiss confirmation exists; no undo after dismiss |
| 4 | Consistency and Standards | 2 | Dual icon libraries; #C41230 inline vs #C20000 token |
| 5 | Error Prevention | 3 | Confirmation modal on destructive action |
| 6 | Recognition Rather Than Recall | 2 | Blood stock legend below fold; no tooltips; icon-only collapsed sidebar |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; no filter/sort on blood stock table |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; three columns equal weight obscures critical priority |
| 9 | Error Recovery | 2 | API failures silently resolve; minimal empty states |
| 10 | Help and Documentation | 1 | Help button has no action or route |
| **Total** | | **24/40** | **Acceptable** |

## Anti-Patterns Verdict

No automated slop patterns detected (detect.mjs returned []). Not AI-generated slop. Main miss: equal column weight obscures alert priority.

## Priority Issues

[P1] No responsive layout — grid-cols-5 and grid-cols-3 without breakpoints. Breaks below ~1280px.

[P1] Two brand reds in production — #C41230 inline vs #C20000 token. Measurably different.

[P2] Critical alerts in Column 3 — last column scanned in Western reading order.

[P2] Icon-only buttons missing aria-label — AlertCard X button, modal close button.

[P2] text-gray-500 on white at 13px — ~4.48:1 contrast, borderline fails WCAG AA.

## Persona Red Flags

Alex (Power User): No way to filter stock table by critical only; irreversible dismiss with confirmation adds friction.

Sam (Accessibility): Collapsed sidebar icon-only with no ARIA labels; blood stock legend after 48 undescribed cells.

On-Call Coordinator: At 1366px viewport, stat row squashes. Alerts in Col 3. No change indicator since last visit.

## Minor Observations

Donor hotspot placeholder visible in production. Help button does nothing. transition-all on sidebar. No prefers-reduced-motion on loading animations. Three hardcoded stat values.
