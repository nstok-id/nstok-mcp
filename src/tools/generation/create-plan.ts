import { z } from 'zod';
import { GenerationService } from '../../services/generation.service.js';
import { jsonResponse } from '../common.js';

export const createAppPlanSchema = z.object({
  appName: z.string().describe('Target application name (e.g. "nstok-app-w")'),
  prd: z.string().describe('PRD specifications or requirements'),
  template: z.string().optional().describe('Custom baseline template (defaults to Nstok-app-template)')
});

export async function handleCreateAppPlan(args: z.infer<typeof createAppPlanSchema>) {
  const generationService = GenerationService.getInstance();
  const plan = generationService.createAppPlan(args.appName, args.prd, args.template);

  return jsonResponse(plan);
}

export const createFeaturePlanSchema = z.object({
  featureName: z.string().describe('Feature name (e.g. "sales-report", "loyalty-points")'),
  capabilities: z.array(z.string()).describe('List of capabilities provided by this new feature')
});

export async function handleCreateFeaturePlan(args: z.infer<typeof createFeaturePlanSchema>) {
  const generationService = GenerationService.getInstance();
  const plan = generationService.createFeaturePlan(args.featureName, args.capabilities);

  return jsonResponse(plan);
}
