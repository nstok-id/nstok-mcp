# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-11

### Added
- **TypeScript MCP Server Core**: Initial implementation of the NSTOK AI Software Factory MCP Server using `@modelcontextprotocol/sdk` and `zod`.
- **Domain Models & Graph Schema**:
  - Entity types for `Repository`, `Application`, `Feature`, `UIComponent`, `DBEntity`, and `KnowledgeGraph`.
  - Structured schemas for `AppPlan`, `FeaturePlan`, and `PRDAnalysisResult`.
- **Services**:
  - `KnowledgeService`: Hybrid keyword & semantic search, knowledge graph traversal, and dynamic feedback ingestion.
  - `GenerationService`: PRD parsing, capability extraction, and `SEARCH → REUSE → ADAPT → CREATE` decision engine.
  - `RepositoryService`: Sandboxed workspace mutations, path traversal protection, and template cloning.
  - `GitService`: Automated feature branch creation, commit generator, diff viewer, and PR proposer.
  - `ValidationService`: Rule-based architecture validator enforcing `UI-001`, `DB-001`, `ARCH-001`, and `DEP-001` with test/lint/build job runners.
  - `AuditService`: Structured audit logger tracking all operations and mutations into `audit.log.jsonl`.
- **MCP Tool Catalog (25+ Tools)**:
  - *Discovery*: `search_knowledge`, `find_features`, `find_ui_components`, `find_db_entities`, `find_existing_patterns`, `get_project_context`, `get_feature_context`, `get_app_context`.
  - *Planning*: `analyze_prd`, `create_app_plan`, `create_feature_plan`.
  - *Generation*: `clone_app_template`, `clone_feature_template`, `add_feature_to_app`, `create_app`, `create_feature`.
  - *Repository & Git*: `read_file`, `write_file`, `search_repo_code`, `git_status`, `git_diff`, `create_branch`, `create_commit`, `create_pull_request`.
  - *Validation & Knowledge Loop*: `validate_architecture`, `run_tests`, `run_lint`, `run_build`, `update_knowledge`.
- **Ecosystem Seed Data**: Pre-seeded knowledge base covering `Nstok-db`, `Nstok-ui`, `Nstok-feature-a` (Auth), `Nstok-feature-b` (Products), `Nstok-feature-c` (Inventory), `Nstok-app-q`, and templates.
- **Antigravity Customization Plugin**: Bundled `.agents/plugins/nstok-factory` manifest and `mcp_config.json`.
- **Automated Test Suites**: 13 unit and integration tests using Vitest covering discovery, graph traversal, PRD planning, architecture validation, and server instantiation.
- **Documentation**: Comprehensive `README.md` containing architectural diagrams, workflow guides, and tool reference.
