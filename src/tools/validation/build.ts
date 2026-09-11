import { z } from 'zod';
import { ValidationService } from '../../services/validation.service.js';
import { jsonResponse } from '../common.js';

export const runBuildSchema = z.object({
  repository: z.string().describe('Repository name to run compilation and build for')
});

export async function handleRunBuild(args: z.infer<typeof runBuildSchema>) {
  const validationService = ValidationService.getInstance();
  const result = validationService.runBuild(args.repository);

  return jsonResponse(result);
}
