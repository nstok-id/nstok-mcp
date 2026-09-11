import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse } from '../common.js';

export const updateKnowledgeSchema = z.object({
  id: z.string().describe('Unique identifier of the newly created entity (e.g. "sales-report", "Nstok-app-w")'),
  name: z.string().describe('Human readable name of the asset'),
  type: z.enum(['feature', 'ui_component', 'db_entity', 'application', 'repository', 'pattern']).describe('Asset type'),
  repository: z.string().describe('Repository containing the asset'),
  description: z.string().describe('Overview of what the asset does'),
  capabilities: z.array(z.string()).optional().describe('List of capabilities provided'),
  dependencies: z.array(z.string()).optional().describe('Dependencies used by this asset'),
  uiComponents: z.array(z.string()).optional().describe('UI components used by this asset'),
  dbEntities: z.array(z.string()).optional().describe('DB entities used by this asset'),
  relationships: z.array(
    z.object({
      targetId: z.string(),
      relationship: z.enum(['CONTAINS', 'USES', 'DEPENDS_ON', 'BASED_ON', 'IMPLEMENTED_IN', 'BELONGS_TO'])
    })
  ).optional().describe('Graph relationships to link')
});

export async function handleUpdateKnowledge(args: z.infer<typeof updateKnowledgeSchema>) {
  const knowledgeService = KnowledgeService.getInstance();

  const rels = [...(args.relationships || [])];

  // Automatically derive standard relationships if not explicitly provided
  if (args.dependencies) {
    for (const dep of args.dependencies) {
      rels.push({ targetId: dep, relationship: 'DEPENDS_ON' });
    }
  }
  if (args.uiComponents) {
    for (const ui of args.uiComponents) {
      rels.push({ targetId: ui, relationship: 'USES' });
    }
  }
  if (args.dbEntities) {
    for (const db of args.dbEntities) {
      rels.push({ targetId: db, relationship: 'USES' });
    }
  }

  const result = knowledgeService.updateKnowledge({
    type: args.type as any,
    id: args.id,
    name: args.name,
    repository: args.repository,
    description: args.description,
    metadata: {
      capabilities: args.capabilities || [],
      dependencies: args.dependencies || [],
      uiComponents: args.uiComponents || [],
      dbEntities: args.dbEntities || []
    },
    relationships: rels
  });

  return jsonResponse(result);
}
