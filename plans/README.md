# Plans

A plan is one Markdown file in this folder. The app reads it and shows the current phase on Today, and the roadmap, target companies, CGPA calculator and rules in Goals. Nothing about a plan is hard-coded in `index.html`.

## Switch, add or remove a plan

- **Switch:** Setup > Plan, pick a file, press Activate.
- **Turn it off:** Setup > Plan > Disable. Every plan element disappears. Your ticks are kept, so Activate brings them back.
- **Add a new plan:** copy `_template.md`, rename it, edit it, add a line to `index.json`, commit and push.
- **Try one without pushing:** Setup > Plan > Paste a plan instead.
- **Delete a plan for good:** delete its file and its line in `index.json`.

## The format

A frontmatter block, then sections. Lines that start with `>` are comments.

| Section | Lines | Notes |
| --- | --- | --- |
| frontmatter | `id`, `title`, `goal`, `goal-date` | `id` and `title` required; `id` uses letters, digits, hyphens |
| `## Phase: Name` | `dates: A to B`, `priority:`, `floor:`, `exam: on/off`, `lc: 100`, then `done:` and `- [ ] item` lines | at least one phase; `dates` required; add `!gate` to an item to warn before applying until it is ticked |
| `## Deadlines` | `- 2027-02-15 \| title` | shown in Goals > Deadlines |
| `## Targets` | `group: Name` (add `\| dim` to collapse), then `- name \| stipend \| cutoff \| note` | stipend in thousands per month, `-` if unknown |
| `## CGPA` | `baseline:`, `semesters-done:`, `upcoming: Sem 3 = 8.2, Sem 4 = 8.5` | optional; powers the calculator and cutoff badges |
| `## Rules`, `## Notes` | `- text` | shown in Goals under Plan |

Problems are reported in Setup > Plan after you activate a plan, for example "Phase 'Ship block' has no valid dates". The app ignores the line instead of breaking.

## What lives where

The plan file is static and travels with the repo. What you tick, each target's status and your SGPA entries are saved per plan id, on the device, and in the Google Sheet `config` tab if you use sync.
