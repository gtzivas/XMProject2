---
description: Onboard this repo to an AI workflow — produce Hot/Warm/Cold context layers.
agent: agent
---

Execute the `/init` baseline workflow defined in `init_baseline.md` for this repository.

Important guardrails:
- Do not write or modify application source code.
- Do not alter CI behavior.
- Do not perform destructive operations.
- Do not delete existing instruction files or sections.
- External integrations are out of scope for this run; rely on local repo signal + short interview.
- Never block on missing data: record gaps and continue.

## Phase 1 — Pre-init (read-only discovery + approval)

1. Ensure `.init-cache/` is ignored by adding it to `.gitignore` if needed.
2. Scan local repo and collect:
   - file tree, manifests, scripts, CI config
   - existing AI instruction artifacts
   - README/CONTRIBUTING/docs and existing ADR-like files
3. Ask up to 4 interview questions only when not inferable:
   - primary stack/runtime
   - test/lint/typecheck commands
   - top 3 be-careful areas
   - domain shorthand
4. Write:
   - `.init-cache/repo-scan.json`
   - `.init-cache/existing-instructions/` (verbatim copies)
   - `.init-cache/approved-plan.md` (discovery report with frontmatter `status: pending`)
5. Stop and wait for approval:
   - proceed only when human replies `approved` or `approved-plan.md` is edited to `status: approved`.

## Phase 2 — Init orchestrator (single command flow)

Read `.init-cache/approved-plan.md` and execute in one continuous pass:

### Cold outputs
- If no PR/ticket history was fetched, write `docs/archive/README.md` with a "not populated yet" placeholder.
- Otherwise populate archive entries under `docs/archive/<work_id>/README.md`.

### Warm outputs (under `docs/context/`)
- `stack.md`
- `repo-constitution.md`
- `architecture.md`
- List source paths used at the bottom of each file.
- If a target file already exists, write `<name>.proposed` sibling instead of overwriting.

### Hot outputs (AI instructions root)
- Update/create repo instruction file appropriate for this tooling.
- For Copilot repos, target `.github/copilot-instructions.md`.
- Merge by preserving existing content; append new sections; never delete.
- If content cannot be merged in place, preserve it in `docs/context/legacy-instructions.md` with source notes.

## Thin-source behavior

When a section lacks enough source material, include:

<!-- SKELETON: no source content for this section.
     Fill in manually or re-run /init once sources exist. -->

## Finalization

1. Write final summary to `docs/archive/init-history/<YYYY-MM-DD>.md` including:
   - files created/updated
   - all `SKELETON` sections
   - recorded gaps and skipped answers
   - suggested highest-impact next actions
2. Delete `.init-cache/`.

