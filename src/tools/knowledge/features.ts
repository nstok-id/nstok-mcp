import { z } from 'zod';
import { KnowledgeService } from '../../services/knowledge.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const findFeaturesSchema = z.object({
  query: z.string().optional().describe('Keyword to search within feature name, description, or capabilities'),
  capabilities: z.array(z.string()).optional().describe('Specific capabilities required (e.g. ["inventory", "stock-in"])')
});

export async function handleFindFeatures(args: z.infer<typeof findFeaturesSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const features = knowledgeService.findFeatures(args.query, args.capabilities);

  return jsonResponse({
    total: features.length,
    features
  });
}

export const getFeatureContextSchema = z.object({
  featureId: z.string().describe('ID of the feature (e.g. "inventory-management", "auth-management")')
});

export async function handleGetFeatureContext(args: z.infer<typeof getFeatureContextSchema>) {
  const knowledgeService = KnowledgeService.getInstance();
  const context = knowledgeService.getFeatureContext(args.featureId);

  if (!context.feature) {
    return textResponse(`Feature '${args.featureId}' not found in registry.`, true);
  }

  return jsonResponse(context);
}
