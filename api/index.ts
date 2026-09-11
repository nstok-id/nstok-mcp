import type { IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createNSTOKServer } from '../src/server.js';

// Map of active SSE session transports
const activeTransports: Map<string, SSEServerTransport> = new Map();

function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-session-id');
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const sessionId = url.searchParams.get('sessionId') || (req.headers['x-session-id'] as string);

  // 1. Handle SSE Stream Connection (GET request)
  if (req.method === 'GET') {
    // Basic healthcheck / info endpoint if not requesting SSE
    if (url.pathname === '/' && req.headers.accept !== 'text/event-stream') {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(
        JSON.stringify(
          {
            name: 'nstok-mcp-server',
            status: 'online',
            environment: 'vercel-serverless',
            version: '1.0.0',
            endpoints: {
              sse: '/api/index?sse=true',
              messages: '/api/index'
            }
          },
          null,
          2
        )
      );
      return;
    }

    // Initialize MCP server and SSE Transport
    const server = createNSTOKServer();
    // Messages endpoint points back to this handler
    const sseTransport = new SSEServerTransport('/api/index', res);

    activeTransports.set(sseTransport.sessionId, sseTransport);

    req.on('close', () => {
      activeTransports.delete(sseTransport.sessionId);
    });

    await server.connect(sseTransport);
    return;
  }

  // 2. Handle Message Post (POST request)
  if (req.method === 'POST') {
    if (!sessionId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing required sessionId parameter or header' }));
      return;
    }

    const transport = activeTransports.get(sessionId);
    if (!transport) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Active session '${sessionId}' not found or has expired.` }));
      return;
    }

    await transport.handlePostMessage(req, res);
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
}
