import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { config } from './config/environment.js';

// Knowledge Tools
import { searchKnowledgeSchema, handleSearchKnowledge } from './tools/knowledge/search.js';
import {
  findFeaturesSchema,
  handleFindFeatures,
  getFeatureContextSchema,
  handleGetFeatureContext
} from './tools/knowledge/features.js';
import { findUIComponentsSchema, handleFindUIComponents } from './tools/knowledge/ui.js';
import { findDBEntitiesSchema, handleFindDBEntities } from './tools/knowledge/database.js';
import {
  findExistingPatternsSchema,
  handleFindExistingPatterns,
  getProjectContextSchema,
  handleGetProjectContext,
  getAppContextSchema,
  handleGetAppContext
} from './tools/knowledge/patterns.js';

// Generation Tools
import { analyzePRDSchema, handleAnalyzePRD } from './tools/generation/analyze-prd.js';
import {
  createAppPlanSchema,
  handleCreateAppPlan,
  createFeaturePlanSchema,
  handleCreateFeaturePlan
} from './tools/generation/create-plan.js';
import {
  cloneAppTemplateSchema,
  handleCloneAppTemplate,
  addFeatureToAppSchema,
  handleAddFeatureToApp,
  createAppSchema,
  handleCreateApp
} from './tools/generation/create-app.js';
import {
  cloneFeatureTemplateSchema,
  handleCloneFeatureTemplate,
  createFeatureSchema,
  handleCreateFeature
} from './tools/generation/create-feature.js';

// Repository & Git Tools
import { readFileSchema, handleReadFile } from './tools/repository/read.js';
import { writeFileSchema, handleWriteFile } from './tools/repository/write.js';
import { searchRepoCodeSchema, handleSearchRepoCode } from './tools/repository/search.js';
import {
  gitStatusSchema,
  handleGitStatus,
  gitDiffSchema,
  handleGitDiff,
  createBranchSchema,
  handleCreateBranch,
  createCommitSchema,
  handleCreateCommit,
  createPullRequestSchema,
  handleCreatePullRequest
} from './tools/repository/git.js';

// Validation & Knowledge Loop Tools
import { validateArchitectureSchema, handleValidateArchitecture } from './tools/validation/architecture.js';
import { runTestsSchema, handleRunTests } from './tools/validation/test.js';
import { runLintSchema, handleRunLint } from './tools/validation/lint.js';
import { runBuildSchema, handleRunBuild } from './tools/validation/build.js';
import { updateKnowledgeSchema, handleUpdateKnowledge } from './tools/validation/update-knowledge.js';

export function createNSTOKServer(): McpServer {
  const server = new McpServer({
    name: config.serverName,
    version: config.serverVersion
  });

  // ==========================================
  // 1. DISCOVERY & KNOWLEDGE TOOLS
  // ==========================================

  server.tool(
    'search_knowledge',
    'Search across all NSTOK knowledge assets, features, UI components, DB entities, patterns, and repositories using hybrid search.',
    searchKnowledgeSchema.shape,
    handleSearchKnowledge
  );

  server.tool(
    'find_features',
    'Discover reusable business features from the NSTOK ecosystem (e.g. Nstok-feature-a, b, c) matching capabilities or keywords.',
    findFeaturesSchema.shape,
    handleFindFeatures
  );

  server.tool(
    'find_ui_components',
    'Find reusable design system UI components in Nstok-ui (DataTable, ProductTable, SearchInput, Button, etc.).',
    findUIComponentsSchema.shape,
    handleFindUIComponents
  );

  server.tool(
    'find_db_entities',
    'Search database schemas and entity definitions in Nstok-db (Product, Inventory, Sale, User, etc.).',
    findDBEntitiesSchema.shape,
    handleFindDBEntities
  );

  server.tool(
    'find_existing_patterns',
    'Search established architectural patterns, code conventions, and guidelines in NSTOK.',
    findExistingPatternsSchema.shape,
    handleFindExistingPatterns
  );

  server.tool(
    'get_project_context',
    'Get full repository context, contained assets, and graph relationships for any NSTOK repo.',
    getProjectContextSchema.shape,
    handleGetProjectContext
  );

  server.tool(
    'get_feature_context',
    'Get deep-dive context for a specific feature, including capabilities, routes, UI/DB deps, and graph traversal.',
    getFeatureContextSchema.shape,
    handleGetFeatureContext
  );

  server.tool(
    'get_app_context',
    'Get full application architecture and composition details for a generated or production app.',
    getAppContextSchema.shape,
    handleGetAppContext
  );

  // ==========================================
  // 2. PLANNING TOOLS
  // ==========================================

  server.tool(
    'analyze_prd',
    'Analyze a PRD text, extract required capabilities, match reusable vs missing assets, and compute reuse score.',
    analyzePRDSchema.shape,
    handleAnalyzePRD
  );

  server.tool(
    'create_app_plan',
    'Generate a structured application implementation plan following the SEARCH -> REUSE -> ADAPT -> CREATE principle.',
    createAppPlanSchema.shape,
    handleCreateAppPlan
  );

  server.tool(
    'create_feature_plan',
    'Generate a structured feature development plan scaffolded from Nstok-feature-template.',
    createFeaturePlanSchema.shape,
    handleCreateFeaturePlan
  );

  // ==========================================
  // 3. GENERATION & TEMPLATE TOOLS
  // ==========================================

  server.tool(
    'clone_app_template',
    'Clone the standard baseline Nstok-app-template to initialize a new application workspace.',
    cloneAppTemplateSchema.shape,
    handleCloneAppTemplate
  );

  server.tool(
    'clone_feature_template',
    'Clone the standard Nstok-feature-template to initialize a new feature repository.',
    cloneFeatureTemplateSchema.shape,
    handleCloneFeatureTemplate
  );

  server.tool(
    'add_feature_to_app',
    'Integrate and link an existing or newly created feature into an application workspace.',
    addFeatureToAppSchema.shape,
    handleAddFeatureToApp
  );

  server.tool(
    'create_app',
    'Orchestrate end-to-end application generation from PRD, prioritizing feature reuse and template baselines.',
    createAppSchema.shape,
    handleCreateApp
  );

  server.tool(
    'create_feature',
    'Scaffold a new feature module from Nstok-feature-template when missing capabilities are required.',
    createFeatureSchema.shape,
    handleCreateFeature
  );

  // ==========================================
  // 4. REPOSITORY & GIT TOOLS
  // ==========================================

  server.tool(
    'read_file',
    'Safely read a file inside an NSTOK repository with audit logging and sandbox isolation.',
    readFileSchema.shape,
    handleReadFile
  );

  server.tool(
    'write_file',
    'Safely write or update a file inside an NSTOK repository with audit logging.',
    writeFileSchema.shape,
    handleWriteFile
  );

  server.tool(
    'search_repo_code',
    'Search for code snippets, symbol definitions, and text within an NSTOK repository.',
    searchRepoCodeSchema.shape,
    handleSearchRepoCode
  );

  server.tool(
    'git_status',
    'Get git status, active branch, and modified files for a repository.',
    gitStatusSchema.shape,
    handleGitStatus
  );

  server.tool(
    'git_diff',
    'Inspect git diff in a repository before committing mutations.',
    gitDiffSchema.shape,
    handleGitDiff
  );

  server.tool(
    'create_branch',
    'Create a new feature branch (e.g. feature/ai/create-nstok-app-w) following NSTOK git workflow.',
    createBranchSchema.shape,
    handleCreateBranch
  );

  server.tool(
    'create_commit',
    'Create a structured git commit with a conventional commit message.',
    createCommitSchema.shape,
    handleCreateCommit
  );

  server.tool(
    'create_pull_request',
    'Propose a Pull Request to main branch for human review and approval.',
    createPullRequestSchema.shape,
    handleCreatePullRequest
  );

  // ==========================================
  // 5. VALIDATION & KNOWLEDGE LOOP TOOLS
  // ==========================================

  server.tool(
    'validate_architecture',
    'Validate that code obeys NSTOK architectural rules (UI-001, DB-001, ARCH-001, DEP-001).',
    validateArchitectureSchema.shape,
    handleValidateArchitecture
  );

  server.tool(
    'run_tests',
    'Run unit and integration test suites in an isolated environment.',
    runTestsSchema.shape,
    handleRunTests
  );

  server.tool(
    'run_lint',
    'Run linting and static analysis on an NSTOK repository.',
    runLintSchema.shape,
    handleRunLint
  );

  server.tool(
    'run_build',
    'Run build and TypeScript type-checking for an application or feature.',
    runBuildSchema.shape,
    handleRunBuild
  );

  server.tool(
    'update_knowledge',
    'Feed newly generated application or feature metadata back into Nstok-knowledge-master.',
    updateKnowledgeSchema.shape,
    handleUpdateKnowledge
  );

  return server;
}
