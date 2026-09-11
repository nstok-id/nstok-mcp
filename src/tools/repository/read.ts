import { z } from 'zod';
import { RepositoryService } from '../../services/repository.service.js';
import { textResponse } from '../common.js';

export const readFileSchema = z.object({
  repository: z.string().describe('Repository name (e.g. "Nstok-app-w", "Nstok-ui")'),
  path: z.string().describe('Relative path to file within the repository')
});

export async function handleReadFile(args: z.infer<typeof readFileSchema>) {
  const repoService = RepositoryService.getInstance();
  try {
    const result = repoService.readFile(args.repository, args.path);
    return textResponse(result.content);
  } catch (err: any) {
    return textResponse(`Error reading file: ${err.message}`, true);
  }
}
