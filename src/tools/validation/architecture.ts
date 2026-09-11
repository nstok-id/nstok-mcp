import { z } from 'zod';
import { ValidationService } from '../../services/validation.service.js';
import { jsonResponse } from '../common.js';

export const validateArchitectureSchema = z.object({
  repository: z.string().describe('Repository name to validate (e.g. "Nstok-app-w")')
});

export async function handleValidateArchitecture(args: z.infer<typeof validateArchitectureSchema>) {
  const validationService = ValidationService.getInstance();
  const result = validationService.validateArchitecture(args.repository);

  return jsonResponse(result);
}
