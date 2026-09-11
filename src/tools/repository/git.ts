import { z } from 'zod';
import { GitService } from '../../services/git.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const gitStatusSchema = z.object({
  repository: z.string().describe('Repository name (e.g. "Nstok-app-w")')
});

export async function handleGitStatus(args: z.infer<typeof gitStatusSchema>) {
  const gitService = GitService.getInstance();
  const status = gitService.getStatus(args.repository);

  return jsonResponse(status);
}

export const gitDiffSchema = z.object({
  repository: z.string().describe('Repository name'),
  staged: z.boolean().optional().describe('Whether to view staged diff only')
});

export async function handleGitDiff(args: z.infer<typeof gitDiffSchema>) {
  const gitService = GitService.getInstance();
  const diffResult = gitService.getDiff(args.repository, { staged: args.staged });

  return textResponse(diffResult.diff);
}

export const createBranchSchema = z.object({
  repository: z.string().describe('Repository name'),
  branchName: z.string().describe('New branch name (e.g. "feature/ai/create-nstok-app-w")')
});

export async function handleCreateBranch(args: z.infer<typeof createBranchSchema>) {
  const gitService = GitService.getInstance();
  const result = gitService.createBranch(args.repository, args.branchName);

  return jsonResponse(result);
}

export const createCommitSchema = z.object({
  repository: z.string().describe('Repository name'),
  message: z.string().describe('Commit message following conventional commits'),
  files: z.array(z.string()).optional().describe('Specific files to commit')
});

export async function handleCreateCommit(args: z.infer<typeof createCommitSchema>) {
  const gitService = GitService.getInstance();
  const result = gitService.createCommit(args.repository, args.message, args.files);

  return jsonResponse(result);
}

export const createPullRequestSchema = z.object({
  repository: z.string().describe('Repository name'),
  title: z.string().describe('PR Title (e.g. "feat: initial scaffolding for nstok-app-w")'),
  body: z.string().describe('PR description detailing reused features, UI components, and validation status'),
  targetBranch: z.string().optional().default('main').describe('Target base branch')
});

export async function handleCreatePullRequest(args: z.infer<typeof createPullRequestSchema>) {
  const gitService = GitService.getInstance();
  const result = gitService.createPullRequest(args.repository, args.title, args.body, args.targetBranch);

  return jsonResponse(result);
}
