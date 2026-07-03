<!--
SYNC IMPACT REPORT
==================
Version change:    1.0.0 → 1.0.1
Bump type:         PATCH — no principle changes; plan-template Constitution Check gate
                   populated with real principle-derived checklist rows.

Principles:        Unchanged (5 principles, all intact).
Sections added:    None.
Sections removed:  None.

Templates checked:
  ✅ .specify/templates/plan-template.md
     — Constitution Check placeholder replaced with 5 principle-gate checklist rows.
  ✅ .specify/templates/spec-template.md
     — No direct constitution references; no changes required.
  ✅ .specify/templates/tasks-template.md
     — No direct constitution references; no changes required.

Deferred TODOs:    None.
-->

# XMProject2 Constitution

## Core Principles

### I. Extend, Never Replace

All modifications to workflow assets (agents, skills, prompts, configurations) MUST extend
existing content rather than overwrite it. Existing instruction files, agent definitions,
and skill catalogs MUST be preserved intact. New functionality is added as additions or
amendments; replacement requires explicit justification and a documented migration plan.

**Rationale**: AI workflow assets accumulate institutional knowledge. Silent replacement
destroys that history and breaks dependent agents that reference prior artifacts.

### II. Deterministic & Auditable Outputs

Every generated artifact MUST be deterministic and explicit about its gaps. Unknown or
unresolvable fields MUST use `SKELETON` markers with a short explanation rather than being
silently omitted. Outputs MUST NOT contain undeclared assumptions.

**Rationale**: Agents downstream of a generation step depend on predictable structure.
Hidden unknowns cause silent failures in chained workflows.

### III. Local-Repo Evidence First

When resolving ambiguity or generating context, agents MUST prefer evidence found in the
local repository (README, docs, existing configs, prior artifacts) before attempting
external lookups. External integrations (VCS trackers, wikis, service catalogs) are
treated as optional enrichment only.

**Rationale**: This repo operates in local-only mode by default. External sources may be
unavailable, rate-limited, or unauthenticated. Local evidence is always present and stable.

### IV. Resilient Operations — Never Block on Missing Data

Missing external integrations or unconfigured sources MUST be recorded as gaps and
reported, never treated as blockers. A human-readable gap report MUST accompany any output
that could not be fully resolved. Processing MUST continue to produce the best available
result.

**Rationale**: The `/init` philosophy of this repository is that the human always gets a
working result. Blocking on missing data violates the core onboarding contract.

### V. Separation of Concerns — Strict Directory Ownership

Artifacts and configuration MUST reside in their designated directories and MUST NOT be
placed across boundary lines:

- `.github/agents/` — agent descriptor files
- `.github/prompts/` — slash-command and workflow prompt files
- `.agents/skills/` — reusable skill packs (SKILL.md + assets)
- `.specify/` — Speckit templates, scripts, and workflow registry
- `_bmad/` — BMAD module configuration and helper scripts
- `_bmad-output/` — ALL generated planning, implementation, and test artifacts
- `docs/` — human-readable documentation and context files

**Rationale**: Clear directory ownership makes artifacts discoverable by both humans and
agents without requiring runtime path resolution logic.

## Workflow Asset Standards

- All skill definitions MUST include a `SKILL.md` file with a clear description,
  invocation criteria, and usage examples.
- New agent descriptors MUST be registered in `.specify/integrations/` or the relevant
  BMAD manifest (`_bmad/_config/manifest.yaml`) before being referenced by prompts.
- Prompt files MUST declare their target agent or mode in frontmatter where applicable.
- BMAD module configurations MUST be kept consistent between `_bmad/config.toml` and
  `_bmad/_config/manifest.yaml`.
- The Speckit workflow registry at `.specify/workflows/workflow-registry.json` MUST be
  updated whenever a new workflow is added or an existing one is renamed.

## Quality & Review Process

- No automated quality gates (lint, typecheck, test, build) are currently active.
  This is a known gap; human review compensates until gates are established.
- Changes to workflow assets SHOULD be reviewed for consistency with existing patterns
  before merging — particularly: heading conventions, placeholder syntax, and directory
  placement.
- Any change that removes or renames a prompt, agent, or skill MUST include a search for
  all references to that asset and update or tombstone them accordingly.
- Generated artifacts in `_bmad-output/` are ephemeral by convention and MAY be deleted
  without a migration plan; all other assets require one.

## Governance

This constitution is the authoritative governance document for XMProject2. It supersedes
any conflicting guidance in individual prompt files or agent descriptors.

**Amendment procedure**:
1. Propose the change with rationale in a dedicated commit or PR description.
2. Increment the version according to semantic versioning rules (see below).
3. Update `LAST_AMENDED_DATE` to the date of change.
4. Run the Speckit constitution command to propagate changes to dependent templates.
5. Update `docs/context/repo-constitution.md` to stay in sync with material principle changes.

**Versioning policy**:
- MAJOR — backward-incompatible governance changes: principle removals or redefinitions
  that invalidate prior agent behavior.
- MINOR — new principles, new mandatory sections, or materially expanded guidance.
- PATCH — clarifications, wording corrections, typo fixes, non-semantic refinements.

**Compliance**: All AI agents and human contributors operating in this repository MUST
comply with these principles. Use `.github/copilot-instructions.md` for runtime AI
guidance; use `docs/context/repo-constitution.md` for broader project context.

**Version**: 1.0.1 | **Ratified**: 2026-07-02 | **Last Amended**: 2026-07-02
