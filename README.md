# NSTOK AI Software Factory MCP Server (TypeScript)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.6.1-green.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade **Model Context Protocol (MCP)** server implemented in **TypeScript** that powers the **NSTOK AI Software Factory**. It allows reasoning agents (such as Codex, Antigravity, or Claude) to construct production-ready NSTOK applications directly from PRDs by discovering and reusing existing ecosystem capabilities, UI components, database models, and templates.

---

## 🎯 Core Architectural Philosophy

```
SEARCH → REUSE → ADAPT → CREATE
```

The system strictly enforces the principle: **Never generate code from scratch if an existing asset can satisfy or be adapted to the requirement.**

1. **Reuse First**: Prioritize existing business features (`Nstok-feature-*`), UI components (`Nstok-ui`), and database models (`Nstok-db`).
2. **Template First**: Applications start from `Nstok-app-template`; features start from `Nstok-feature-template`.
3. **Knowledge Before Code**: Understand architecture, dependencies, and patterns before mutating code.
4. **Plan Before Mutation**: `Analyze → Plan → Approve → Implement → Validate`.
5. **Closed Knowledge Loop**: Every newly generated application or feature enriches the central Knowledge Graph (`Nstok-knowledge-master`).

---

## 🏗️ High-Level Architecture

```
                  ┌───────────────────────┐
                  │         CODEX         │
                  │   User / PRD / Task   │
                  └───────────┬───────────┘
                              │ MCP (Stdio / SSE)
                              ▼
             ┌─────────────────────────────────┐
             │        NSTOK MCP SERVER         │
             │                                 │
             │  • PRD Analysis                 │
             │  • Knowledge Graph & Vector     │
             │  • Feature & UI Discovery       │
             │  • Template Orchestrator        │
             │  • Architecture Validator       │
             │  • Sandboxed Git Management     │
             └────────────────┬────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Knowledge   │       │ Repositories │       │  Job Runner  │
│    Master    │       │  Ecosystem   │       │   (Worker)   │
│              │       │              │       │              │
│ Graph + RAG  │       │ UI, DB, Apps │       │ Test / Lint  │
│  & Metadata  │       │ & Features   │       │  Typecheck   │
└──────────────┘       └──────────────┘       └──────────────┘
```

---

## 📦 Project Structure

```
nstok-mcp/
├── src/
│   ├── index.ts                      # CLI entrypoint (Stdio transport)
│   ├── server.ts                     # MCP server instance & tool registration
│   │
│   ├── config/
│   │   └── environment.ts            # Environment variables, security allowlists, timeouts
│   │
│   ├── domain/                       # Core domain models & graph types
│   │   ├── app.ts                    # Application entity
│   │   ├── feature.ts                # Feature & capability interfaces
│   │   ├── component.ts              # UI component definitions
│   │   ├── database.ts               # DB entities & relations
│   │   ├── repository.ts             # Repository metadata & graph relationships
│   │   ├── plan.ts                   # Structured AppPlan & FeaturePlan schemas
│   │   └── graph.ts                  # Graph nodes, edges & traversal results
│   │
│   ├── services/                     # Business logic layers
│   │   ├── knowledge.service.ts      # Hybrid search & graph traversal engine
│   │   ├── repository.service.ts     # Sandboxed workspace operations & template cloning
│   │   ├── generation.service.ts     # PRD analysis & Reuse Decision Engine
│   │   ├── git.service.ts            # Git branching, commit, diff & PR workflow
│   │   ├── validation.service.ts     # Architecture validator (UI-001, DB-001) & jobs
│   │   └── audit.service.ts          # Audit logging for tracking operations
│   │
│   ├── tools/                        # MCP Tool definitions
│   │   ├── knowledge/                # search_knowledge, find_features, find_ui_components, etc.
│   │   ├── generation/               # analyze_prd, create_app_plan, create_app, etc.
│   │   ├── repository/               # read_file, write_file, search_repo_code, git ops
│   │   └── validation/               # validate_architecture, run_tests, update_knowledge
│   │
│   └── data/
│       └── seed.ts                   # Pre-seeded NSTOK ecosystem metadata & graph
│
├── tests/
│   ├── knowledge.test.ts             # Discovery & graph traversal tests
│   ├── generation.test.ts            # PRD analysis & planning tests
│   ├── validation.test.ts            # Architecture validation tests
│   └── server.test.ts                # Server instantiation & tool registration tests
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tool Catalog

### 1. Discovery & Knowledge Tools
| Tool | Description |
| :--- | :--- |
| `search_knowledge` | Hybrid keyword and semantic search across knowledge assets, features, UI, and DB entities. |
| `find_features` | Discover reusable business features (`Nstok-feature-a`, `b`, `c`, etc.) matching capabilities. |
| `find_ui_components` | Find reusable design system components in `Nstok-ui` (`DataTable`, `ProductTable`, `SearchInput`, `Button`, etc.). |
| `find_db_entities` | Search database schemas and entity definitions in `Nstok-db` (`Product`, `Inventory`, `Sale`, `User`, etc.). |
| `find_existing_patterns` | Search established architectural patterns, code conventions, and guidelines in NSTOK. |
| `get_project_context` | Retrieve full repository metadata, contained assets, and graph edges for any NSTOK repo. |
| `get_feature_context` | Deep-dive feature context (routes, UI/DB dependencies, and graph traversal). |
| `get_app_context` | Retrieve full composition details and graph relations for an application. |

### 2. Planning Tools
| Tool | Description |
| :--- | :--- |
| `analyze_prd` | Analyze raw PRD text, extract required capabilities, match reusable vs missing assets, and calculate reuse score. |
| `create_app_plan` | Generate a structured application implementation plan following `SEARCH → REUSE → ADAPT → CREATE`. |
| `create_feature_plan` | Generate a structured feature development plan scaffolded from `Nstok-feature-template`. |

### 3. Generation & Template Tools
| Tool | Description |
| :--- | :--- |
| `clone_app_template` | Clone `Nstok-app-template` baseline into a new application workspace. |
| `clone_feature_template` | Clone `Nstok-feature-template` baseline into a new feature module. |
| `add_feature_to_app` | Link and integrate an existing or new feature module into an application. |
| `create_app` | End-to-end scaffolding orchestrator: clones template, wires reused features, creates missing features, and outputs app composition. |
| `create_feature` | Scaffold a new feature module from template when missing capabilities are required. |

### 4. Repository & Git Tools
| Tool | Description |
| :--- | :--- |
| `read_file` | Safely read file content within an NSTOK repository with audit logging. |
| `write_file` | Safely write or update a file within an NSTOK repository with audit logging. |
| `search_repo_code` | Search for code snippets and symbols within an NSTOK repository. |
| `git_status` | Get git status, active branch, and modified files for a repository. |
| `git_diff` | Inspect git diff before committing changes. |
| `create_branch` | Create a feature branch (`feature/ai/<task>`) adhering to NSTOK git workflow. |
| `create_commit` | Create a structured commit with conventional commit message. |
| `create_pull_request` | Propose a Pull Request to `main` branch for human review and approval. |

### 5. Validation & Knowledge Loop Tools
| Tool | Description |
| :--- | :--- |
| `validate_architecture` | Enforce architecture rules: `UI-001` (no duplicate UI), `DB-001` (Nstok-db access), `ARCH-001`, `DEP-001`. |
| `run_tests` | Run unit and integration test suites in an isolated environment. |
| `run_lint` | Run linting and static analysis on a repository. |
| `run_build` | Run project build and TypeScript compilation. |
| `update_knowledge` | Feed newly generated application or feature metadata back into `Nstok-knowledge-master`. |

---

## ⚡ Quickstart & Installation

### Prerequisites
- Node.js >= 18 (Tested on Node.js 24)
- npm >= 9

### 1. Installation
```bash
git clone <repository_url> nstok-mcp
cd nstok-mcp
npm install
```

### 2. Build
```bash
npm run build
```

### 3. Run Tests
```bash
npm test
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 🔌 Configuration for MCP Clients

### Codex / Antigravity / Claude Desktop Configuration
Add the following snippet to your `mcp_config.json` or `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nstok-software-factory": {
      "command": "node",
      "args": ["<PATH_TO_NSTOK_MCP>/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "ENABLE_AUDIT_LOG": "true"
      }
    }
  }
}
```

---

## 🔄 Example End-to-End Workflow

When a developer requests:
> *"Codex, please build `nstok-app-w` based on this PRD: POS with authentication, product catalog, inventory, checkout, and daily sales report."*

The MCP server coordinates the following pipeline:

```
1. analyze_prd("Nstok-app-w", PRD)
   ├── Extracted: auth, product, inventory, checkout, payment, sales-report
   ├── Reused: Nstok-feature-a, Nstok-feature-b, Nstok-feature-c, checkout-payment
   ├── Missing: sales-report (Scaffold Nstok-feature-sales-report)
   └── Reuse Score: 80%

2. create_app_plan("Nstok-app-w", PRD)
   └── Generates structured implementation plan

3. create_branch("Nstok-app-w", "feature/ai/create-nstok-app-w")

4. create_app("Nstok-app-w", PRD)
   ├── Clones Nstok-app-template
   ├── Links reused features
   └── Scaffolds Nstok-feature-sales-report from Nstok-feature-template

5. validate_architecture("Nstok-app-w")
   └── Checks UI-001 (all UI from Nstok-ui) and DB-001 (all schema from Nstok-db)

6. run_tests("Nstok-app-w") & run_build("Nstok-app-w")

7. create_commit("Nstok-app-w", "feat: initial scaffolding for nstok-app-w")

8. create_pull_request("Nstok-app-w", "feat: nstok-app-w implementation", summary)

9. update_knowledge(...)
   └── Central graph updated so future apps can reuse Nstok-feature-sales-report!
```

---

## 🔒 Security Model

- **Repository Allowlist**: Enforces `Nstok-*` repository naming pattern.
- **Path Traversal Protection**: All filesystem reads and writes are sandboxed to the active workspace.
- **Audit Trail**: Every mutation (`write_file`, `create_branch`, `create_commit`, `create_pull_request`) is appended to `audit.log.jsonl`.
- **Command Allowlist**: Strict restrictions on executable commands (`node`, `npm`, `npx`, `git`, `tsc`).

---

## 📄 License
MIT © NSTOK Engineering
