# AI instructions

## Repo purpose (one line)
Maintain AI workflow assets (agents, prompts, skills, and generated artifacts) for BMAD and Speckit-enabled processes.

## Stack (one line)
Mixed AI workflow repository using Markdown prompts, TOML/YAML/JSON configs, and Python utility scripts (runtime not explicitly defined).

## Quality gates
- Lint: not detected
- Typecheck: not detected
- Test: not detected
- Build: not detected

## How we work
- Preserve existing instruction and agent content; extend safely instead of replacing.
- Treat missing external integrations as gaps to record, not blockers.
- Keep output deterministic and explicit about unknowns using SKELETON markers where needed.
- Prefer local-repo evidence first when generating context.

## Reference
- Identity & scope: docs/context/repo-constitution.md
- Architecture: docs/context/architecture.md
- Historical work: docs/archive/
