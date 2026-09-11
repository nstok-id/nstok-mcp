import { z } from 'zod';
import { GenerationService } from '../../services/generation.service.js';
import { jsonResponse } from '../common.js';

export const analyzePRDSchema = z.object({
  appName: z.string().describe('Target application name (e.g. "nstok-app-w")'),
  prd: z.string().describe('Product Requirement Document (PRD) text or feature list')
});

export async function handleAnalyzePRD(args: z.infer<typeof analyzePRDSchema>) {
  const generationService = GenerationService.getInstance();
  const result = generationService.analyzePRD(args.appName, args.prd);

  return jsonResponse(result);
}
