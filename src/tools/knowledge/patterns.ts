import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const findExistingPatternsSchema = z.object({
  query: z.string().optional().describe('Search pattern by keyword (e.g. "reuse", "template", "drizzle", "git")'),
  category: z.string().optional().describe('Filter by pattern category')
});

export async function handleFindExistingPatterns(args: z.infer<typeof findExistingPatternsSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const patterns = knowledgeService.findPatterns(args.query, args.category);

  return jsonResponse({
    total: patterns.length,
    patterns
  });
}

export const getProjectContextSchema = z.object({
  repositoryName: z.string().describe('Repository name to inspect (e.g. "Nstok-ui", "Nstok-db", "Nstok-feature-a", "Nstok-app-q")')
});

export async function handleGetProjectContext(args: z.infer<typeof getProjectContextSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const context = knowledgeService.getProjectContext(args.repositoryName);

  if (!context.repository) {
    return textResponse(`Repository '${args.repositoryName}' not found in ecosystem.`, true);
  }

  return jsonResponse(context);
}

export const getAppContextSchema = z.object({
  appName: z.string().describe('Application repository name (e.g. "Nstok-app-q", "Nstok-app-w")')
});

export async function handleGetAppContext(args: z.infer<typeof getAppContextSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const context = knowledgeService.getAppContext(args.appName);

  return jsonResponse(context);
}
