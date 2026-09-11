import { z } from 'zod';
import { RepositoryService } from '../../services/repository.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const writeFileSchema = z.object({
  repository: z.string().describe('Repository name (e.g. "Nstok-app-w", "Nstok-feature-sales-report")'),
  path: z.string().describe('Relative path to file within the repository'),
  content: z.string().describe('Full file content to write'),
  overwrite: z.boolean().optional().default(true).describe('Whether to overwrite if file already exists')
});

export async function handleWriteFile(args: z.infer<typeof writeFileSchema>) {
  const repoService = RepositoryService.getInstance();
  try {
    const result = repoService.writeFile(args.repository, args.path, args.content, { overwrite: args.overwrite });
    return jsonResponse({
      success: true,
      repository: args.repository,
      path: args.path,
      bytesWritten: result.bytesWritten
    });
  } catch (err: any) {
    return textResponse(`Error writing file: ${err.message}`, true);
  }
}
