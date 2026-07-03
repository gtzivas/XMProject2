---
description: Onboard this repo to an AI workflow — produce Hot/Warm/Cold context layers.
mode: agent
---

You are executing slash command /xminit.

Goal:
Onboard this repository to an agentic AI workflow without writing application code. Produce three context layers from available sources:
- Cold: history and archival context
- Warm: stable repo context docs
- Hot: always-on AI instructions

Hard constraints:
- No source-code edits.
- No CI changes.
- No secrets handling.
- No destructive operations on existing instruction files.
- Never block on missing data; record gaps and continue.
- Ask at most 4 interview questions and only when needed.
- Treat external integrations as not wired for this run; skip external fetching.

Execution model:
Single command, sequential execution in one pass. Do not spawn separate agents.

Follow these phases exactly.

## Phase 1 - Pre-init (read-only discovery + approval gate)

1. Ensure cache path exists:
- .init-cache/
- .init-cache/existing-instructions/

2. Ensure .init-cache is ignored:
- If .gitignore exists and does not include .init-cache/, append .init-cache/
- If .gitignore does not exist, create it with .init-cache/

3. Read-only local discovery. Gather evidence from:
- File tree, package manifests, CI configs, test/lint scripts
- Existing AI instruction files if present:
  - .github/copilot-instructions.md
  - AGENTS.md
  - CLAUDE.md
  - .cursor/rules/*
  - .cursorrules
  - .junie/guidelines.md
  - .junie/commands/*
- README.md, CONTRIBUTING.md, docs/**
- Existing ADR/TDR locations:
  - docs/adr/
  - docs/architecture/decisions/

4. Persist discovery cache:
- Write .init-cache/repo-scan.json with the local detector results.
- Copy discovered instruction files verbatim into .init-cache/existing-instructions/ preserving relative names where practical.

5. Ask a short interview only for unknowns (max 4 questions total):
- Primary stack + runtime version (only if detection failed or mixed)
- Test runner + lint/typecheck commands (only if not detected)
- Top 3 be-careful areas (modules/files/domains)
- Domain shorthand (acronyms, bounded contexts, key entities)
If the human replies skip for any question, record skip and continue.

6. Create discovery report at .init-cache/approved-plan.md with this shape:

---
status: pending
---

# Init discovery - <repo-slug>

## What I found
- Stack: <detected or mixed>
- Existing AI artifacts: <list or none>
- Existing docs: <list or none>

## Proposed file plan

### Cold - docs/archive/
- (empty if no PR/ticket history fetched)

### Warm - docs/context/
- docs/context/stack.md (new)
- docs/context/repo-constitution.md (new)
- docs/context/architecture.md (new)

### Hot - AI instructions root
- .github/copilot-instructions.md (update, preserves existing)
- AGENTS.md (new or update)

## Gaps recorded
- VCS history not fetched (no integration configured) - skipped
- Wiki not fetched (no integration configured) - skipped
- <interview skips and unresolved unknowns>

## Interview answers
1. Stack: <answer or skip>
2. Test/lint commands: <answer or skip>
3. Be-careful areas: <answer or skip>
4. Domain shorthand: <answer or skip>

> To proceed: reply approved in chat, or edit this file and set status: approved.
> To edit the plan first: change any line above, then approve.

7. Stop and wait for approval:
- Do not write final docs yet.
- Re-read .init-cache/approved-plan.md only when the human indicates approval.
- Continue only when frontmatter has status: approved OR the human clearly approves in chat.

## Phase 2 - Init orchestrator (single-command execution)

Use only local repo + .init-cache content from Phase 1. No external fetching.

### Cold output
- If no PR/ticket data exists in cache, write docs/archive/README.md:

# Archive - not populated yet

No PR/ticket history was fetched on this init run.
Re-run /init --refresh once a VCS / issue-tracker integration is configured (see init_baseline.md section 6).

- If historical items exist, write docs/archive/<work_id>/README.md per item.

### Warm outputs (docs/context/)
Write these files from local evidence + interview data:
- docs/context/stack.md
- docs/context/repo-constitution.md
- docs/context/architecture.md

Rules:
- Each file includes source paths used at the end.
- Preserve existing files. If target exists, write a sibling with .proposed suffix instead of overwriting.
- If any section lacks enough source material, include this exact marker:

<!-- SKELETON: no source content for this section.
     Fill in manually or re-run /init once sources exist. -->

### Hot outputs (AI instructions)
Generate or update always-on instructions in:
- .github/copilot-instructions.md and/or AGENTS.md (choose based on what exists; preserve existing content)

Template to include:
- Repo purpose (one line)
- Stack (one line; refer to docs/context/stack.md)
- Quality gates (lint, typecheck, test, build with detected command or not detected)
- How we work (do/don't from interview be-careful areas + existing instructions)
- References to:
  - docs/context/repo-constitution.md
  - docs/context/architecture.md
  - docs/archive/

Rules:
- Never delete existing instruction sections.
- If new structure cannot absorb old content cleanly, move that content to docs/context/legacy-instructions.md with provenance notes.
- Surface merge conflicts in final summary; do not silently discard content.

## Final summary and cleanup

1. Write docs/archive/init-history/<YYYY-MM-DD>.md including:
- Files created/updated
- Sections marked SKELETON (with paths)
- Recorded gaps (missing integrations, skipped interview answers, preserved-but-unmerged conflicts)
- Suggested next actions prioritized by highest signal gain

2. Delete .init-cache/ after summary is written.

Behavioral notes:
- Keep the human in the loop before repo writes by enforcing approval gate.
- Continue with gaps; missing data is never a failure.
- Make output deterministic and concise.
