import { z } from 'zod';
import { GenerationService } from '../../services/generation.service.js';
import { RepositoryService } from '../../services/repository.service.js';
import { jsonResponse, textResponse } from '../common.js';

export const cloneAppTemplateSchema = z.object({
  templateName: z.string().default('Nstok-app-template').describe('Base template name'),
  appName: z.string().describe('Target application repository name (e.g. "Nstok-app-w")')
});

export async function handleCloneAppTemplate(args: z.infer<typeof cloneAppTemplateSchema>) {
  const repoService = RepositoryService.getInstance();
  const result = repoService.cloneAppTemplate(args.templateName, args.appName);

  return jsonResponse(result);
}

export const addFeatureToAppSchema = z.object({
  appName: z.string().describe('Target application repository name (e.g. "Nstok-app-w")'),
  featureRepository: z.string().describe('Feature repository to integrate (e.g. "Nstok-feature-a", "Nstok-feature-c")')
});

export async function handleAddFeatureToApp(args: z.infer<typeof addFeatureToAppSchema>) {
  const repoService = RepositoryService.getInstance();
  
  // Read target app package.json and update dependencies
  try {
    const pkgResult = repoService.readFile(args.appName, 'package.json');
    const pkg = JSON.parse(pkgResult.content);
    
    if (!pkg.dependencies) pkg.dependencies = {};
    const featPkgName = `@nstok/${args.featureRepository.toLowerCase()}`;
    pkg.dependencies[featPkgName] = 'workspace:*';

    repoService.writeFile(args.appName, 'package.json', JSON.stringify(pkg, null, 2), { overwrite: true });

    return jsonResponse({
      success: true,
      message: `Successfully linked ${args.featureRepository} into ${args.appName}`,
      dependencyAdded: `${featPkgName}: workspace:*`
    });
  } catch (err: any) {
    return textResponse(`Failed to add feature to app: ${err.message}`, true);
  }
}

export const createAppSchema = z.object({
  name: z.string().describe('Application name (e.g. "nstok-app-w")'),
  prd: z.string().describe('PRD text containing features and capabilities'),
  template: z.string().optional().describe('App template repository name (defaults to Nstok-app-template)')
});

export async function handleCreateApp(args: z.infer<typeof createAppSchema>) {
  const generationService = GenerationService.getInstance();
  const result = generationService.createApp(args.name, args.prd, args.template);

  return jsonResponse(result);
}
