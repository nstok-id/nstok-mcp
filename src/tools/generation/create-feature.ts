import { z } from 'zod';
import { RepositoryService } from '../../services/repository.service.js';
import { GenerationService } from '../../services/generation.service.js';
import { config } from '../../config/environment.js';
import { jsonResponse } from '../common.js';

export const cloneFeatureTemplateSchema = z.object({
  templateName: z.string().default('Nstok-feature-template').describe('Base feature template'),
  featureName: z.string().describe('Target feature repository name (e.g. "Nstok-feature-sales-report")'),
  description: z.string().describe('Short summary of what this feature does')
});

export async function handleCloneFeatureTemplate(args: z.infer<typeof cloneFeatureTemplateSchema>) {
  const repoService = RepositoryService.getInstance();
  const result = repoService.cloneFeatureTemplate(args.templateName, args.featureName, args.description);

  return jsonResponse(result);
}

export const createFeatureSchema = z.object({
  featureName: z.string().describe('Feature name (e.g. "sales-report")'),
  capabilities: z.array(z.string()).describe('List of capabilities provided by this feature (e.g. ["daily-summary", "revenue-analytics"])'),
  description: z.string().optional().describe('Feature description')
});

export async function handleCreateFeature(args: z.infer<typeof createFeatureSchema>) {
  const repoService = RepositoryService.getInstance();
  const generationService = GenerationService.getInstance();

  const repoName = args.featureName.startsWith('Nstok-feature-')
    ? args.featureName
    : `Nstok-feature-${args.featureName.toLowerCase()}`;

  const plan = generationService.createFeaturePlan(args.featureName, args.capabilities);
  const cloneResult = repoService.cloneFeatureTemplate(
    config.defaultFeatureTemplate,
    repoName,
    args.description || `Feature module providing ${args.capabilities.join(', ')}`
  );

  return jsonResponse({
    featureName: args.featureName,
    repository: repoName,
    plan,
    cloneResult
  });
}
