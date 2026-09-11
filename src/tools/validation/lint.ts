import { z } from 'zod';
import { ValidationService } from '../../services/validation.service.js';
import { jsonResponse } from '../common.js';

export const runLintSchema = z.object({
  repository: z.string().describe('Repository name to run static analysis and linting for')
});

export async function handleRunLint(args: z.infer<typeof runLintSchema>) {
  const validationService = ValidationService.getInstance();
  const result = validationService.runLint(args.repository);

  return jsonResponse(result);
}
