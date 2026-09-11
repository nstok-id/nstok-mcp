import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse } from '../common.js';

export const findDBEntitiesSchema = z.object({
  query: z.string().optional().describe('Search database entities by name, table name, or field name (e.g. "Product", "inventories", "sku")')
});

export async function handleFindDBEntities(args: z.infer<typeof findDBEntitiesSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const entities = knowledgeService.findDBEntities(args.query);

  return jsonResponse({
    repository: 'Nstok-db',
    total: entities.length,
    entities
  });
}
