import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse } from '../common.js';

export const findUIComponentsSchema = z.object({
  query: z.string().optional().describe('Search component by name, description, or prop name'),
  category: z.enum(['layout', 'data-display', 'form', 'feedback', 'navigation', 'overlay']).optional().describe('Filter by UI component category')
});

export async function handleFindUIComponents(args: z.infer<typeof findUIComponentsSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const components = knowledgeService.findUIComponents(args.query, args.category);

  return jsonResponse({
    repository: 'Nstok-ui',
    total: components.length,
    components
  });
}
