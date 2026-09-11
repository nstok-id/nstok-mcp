import { z } from 'zod';
import { RepositoryService } from '../../services/repository.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const searchRepoCodeSchema = z.object({
  repository: z.string().describe('Repository name (e.g. "Nstok-app-w", "Nstok-ui")'),
  query: z.string().describe('String to search for in files'),
  extensions: z.array(z.string()).optional().describe('File extensions to include (e.g. [".ts", ".tsx"])')
});

export async function handleSearchRepoCode(args: z.infer<typeof searchRepoCodeSchema>) {
  const repoService = RepositoryService.getInstance();
  try {
    const results = repoService.searchRepoCode(args.repository, args.query, args.extensions);
    return jsonResponse({
      repository: args.repository,
      query: args.query,
      totalFilesMatched: results.length,
      results
    });
  } catch (err: any) {
    return textResponse(`Error searching repo code: ${err.message}`, true);
  }
}
