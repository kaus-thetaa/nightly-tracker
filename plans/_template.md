---
id: my-plan-id
title: Name of the plan
goal: One sentence: what this plan is for
goal-date: 2027-12-31
---

> HOW THIS FILE WORKS
> Copy this file, rename it (for example plans/fall-2027.md), edit it, add it to plans/index.json, push, then pick it in Setup > Plan > Activate.
> Lines starting with ">" are comments and are ignored. Every section is optional except the frontmatter above and at least one phase.
> "id" must be unique and use letters, digits and hyphens. Ticks and statuses are saved per id, so changing a plan's id starts it fresh.
> Dates are always YYYY-MM-DD.

## Phase: First phase name
dates: 2026-12-01 to 2026-12-31
priority: What matters most in this phase.
floor: The minimum that still counts as a good day.
exam: on
lc: 100
done:
- [ ] Something that must be true by the end of this phase
- [ ] Another item. Add !gate at the end of an item to warn before applying anywhere until it is ticked !gate

> Phase keys: dates (required), priority, floor, exam (on or off; suggests exam mode), lc (LeetCode total wanted by the end of the phase), done (list below it).

## Phase: Second phase name
dates: 2027-01-01 to 2027-01-31
priority: Next focus.
floor: Daily minimum.
lc: 150
done:
- [ ] Item

## Deadlines
- 2027-02-01 | A dated reminder that is not a phase

## Targets
> name | stipend (thousands per month, or - if unknown) | CGPA cutoff (or - if none) | note
> A "| dim" after the group name collapses the group by default.

group: Realistic
- Company A | 100 | 7.0 | Short note
- Company B | - | 6.5 | Short note

group: Stretch | dim
- Company C | 150 | 8.0 | Short note

## CGPA
> Optional. Powers the CGPA calculator and the clears / reachable / out of reach badges.
baseline: 7.45
semesters-done: 2
upcoming: Sem 3 = 8.0, Sem 4 = 8.5

## Rules
- A rule you want to keep in view.

## Notes
- A caveat worth remembering.
