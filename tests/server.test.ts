import { describe, it, expect } from 'vitest';
import { createNSTOKServer } from '../src/server.js';

describe('NSTOK MCP Server', () => {
  it('should instantiate the MCP Server and register tools', () => {
    const server = createNSTOKServer();
    expect(server).toBeDefined();
    // server is an instance of McpServer
    expect(typeof server.connect).toBe('function');
  });
});
