# Architecture

## Repository Layout
- .github/agents/: agent descriptors for BMAD and Speckit roles.
- .github/prompts/: slash-command prompts and workflow prompts.
- .agents/skills/: skill packs with SKILL.md instructions.
- .specify/: Spec Kit templates, scripts, and workflow registry.
- _bmad/: BMAD configuration, modules, and helper scripts.
- _bmad-output/: generated planning, implementation, and test artifacts.
- docs/: documentation root (context and archive content).

## Entry Points
- Prompt execution entry points: .github/prompts/*.prompt.md
- Agent definitions: .github/agents/*.agent.md
- BMAD module configuration: _bmad/config.toml and _bmad/_config/manifest.yaml
- Spec Kit workflow registry: .specify/workflows/workflow-registry.json

## Decisions and ADRs
<!-- SKELETON: no source content for this section.
     Fill in manually or re-run /init once sources exist. -->

## Operational Boundaries
- This repo is configuration/documentation oriented rather than an application codebase.
- External system enrichment is currently disabled for init (local-only mode).

## Source Paths
- .init-cache/repo-scan.json
- _bmad/config.toml
- _bmad/_config/manifest.yaml
- .specify/workflows/workflow-registry.json
- README.md
