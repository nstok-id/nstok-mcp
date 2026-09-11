#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createNSTOKServer } from './server.js';
import { config } from './config/environment.js';

async function main() {
  const server = createNSTOKServer();
  const transport = new StdioServerTransport();

  // Log startup info to stderr (stdio stdout is reserved for JSON-RPC MCP messages)
  console.error(`Starting ${config.serverName} v${config.serverVersion}...`);
  console.error(`Workspace Root: ${config.workspaceRoot}`);
  console.error(`Architectural Mode: SEARCH -> REUSE -> ADAPT -> CREATE`);

  await server.connect(transport);
  console.error(`${config.serverName} connected and listening on stdio.`);
}

main().catch((err) => {
  console.error('Fatal error starting NSTOK MCP Server:', err);
  process.exit(1);
});
