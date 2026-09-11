import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse } from '../common.js';

export const searchKnowledgeSchema = z.object({
  query: z.string().describe('Search query text or keywords for knowledge assets, features, UI, or DB entities'),
  type: z.enum(['feature', 'ui_component', 'db_entity', 'pattern', 'repository', 'application']).optional().describe('Filter by asset type'),
  repository: z.string().optional().describe('Filter by repository name (e.g. Nstok-ui, Nstok-db)')
});

export async function handleSearchKnowledge(args: z.infer<typeof searchKnowledgeSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const results = knowledgeService.searchKnowledge(args.query, {
    type: args.type as any,
    repository: args.repository
  });

  return jsonResponse({
    query: args.query,
    totalFound: results.length,
    results
  });
}
