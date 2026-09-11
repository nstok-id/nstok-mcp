import { z } from 'zod';
import { ValidationService } from '../../services/validation.service.js';
import { jsonResponse } from '../common.js';

export const runTestsSchema = z.object({
  repository: z.string().describe('Repository name to run unit & integration tests for'),
  testFilter: z.string().optional().describe('Optional test pattern/filter to run specific test files')
});

export async function handleRunTests(args: z.infer<typeof runTestsSchema>) {
  const validationService = ValidationService.getInstance();
  const result = validationService.runTests(args.repository, args.testFilter);

  return jsonResponse(result);
}
