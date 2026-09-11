import fs from 'fs';
import path from 'path';
import { config } from '../config/environment.js';
import { AuditService } from './audit.service.js';

export class RepositoryService {
  private static instance: RepositoryService;
  private auditService: AuditService;

  private constructor() {
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): RepositoryService {
    if (!RepositoryService.instance) {
      RepositoryService.instance = new RepositoryService();
    }
    return RepositoryService.instance;
  }

  private resolveRepoPath(repoName: string): string {
    // Validate repo name security pattern
    if (!config.allowedRepoPattern.test(repoName)) {
      throw new Error(`Invalid repository name '${repoName}'. Repository name must match pattern '${config.allowedRepoPattern}'.`);
    }

    const fullPath = path.resolve(config.workspaceRoot, repoName);
    // Security check: ensure path does not escape workspace root
    if (!fullPath.startsWith(path.resolve(config.workspaceRoot))) {
      throw new Error(`Security Violation: Path traversal detected for repository '${repoName}'.`);
    }

    return fullPath;
  }

  public ensureRepoDir(repoName: string): string {
    const repoPath = this.resolveRepoPath(repoName);
    if (!fs.existsSync(repoPath)) {
      fs.mkdirSync(repoPath, { recursive: true });
    }
    return repoPath;
  }

  public readFile(repoName: string, relativeFilePath: string): { content: string; size: number } {
    const repoPath = this.resolveRepoPath(repoName);
    const resolvedFilePath = path.resolve(repoPath, relativeFilePath);

    if (!resolvedFilePath.startsWith(repoPath)) {
      throw new Error(`Security Violation: File path '${relativeFilePath}' escapes repository '${repoName}'.`);
    }

    if (!fs.existsSync(resolvedFilePath)) {
      throw new Error(`File not found: '${relativeFilePath}' in repository '${repoName}'.`);
    }

    const content = fs.readFileSync(resolvedFilePath, 'utf-8');
    this.auditService.log({
      actor: 'codex',
      action: 'read_file',
      repository: repoName,
      path: relativeFilePath,
      status: 'success'
    });

    return {
      content,
      size: Buffer.byteLength(content, 'utf-8')
    };
  }

  public writeFile(
    repoName: string,
    relativeFilePath: string,
    content: string,
    options?: { overwrite?: boolean }
  ): { success: boolean; bytesWritten: number; fullPath: string } {
    const repoPath = this.ensureRepoDir(repoName);
    const resolvedFilePath = path.resolve(repoPath, relativeFilePath);

    if (!resolvedFilePath.startsWith(repoPath)) {
      throw new Error(`Security Violation: File path '${relativeFilePath}' escapes repository '${repoName}'.`);
    }

    if (fs.existsSync(resolvedFilePath) && options?.overwrite === false) {
      throw new Error(`File already exists at '${relativeFilePath}' and overwrite is disabled.`);
    }

    const parentDir = path.dirname(resolvedFilePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(resolvedFilePath, content, 'utf-8');
    const bytesWritten = Buffer.byteLength(content, 'utf-8');

    this.auditService.log({
      actor: 'codex',
      action: 'write_file',
      repository: repoName,
      path: relativeFilePath,
      status: 'success',
      details: { bytesWritten }
    });

    return {
      success: true,
      bytesWritten,
      fullPath: resolvedFilePath
    };
  }

  public searchRepoCode(
    repoName: string,
    query: string,
    extensions: string[] = ['.ts', '.tsx', '.js', '.json', '.md']
  ): Array<{ filePath: string; lineMatches: Array<{ line: number; text: string }> }> {
    const repoPath = this.resolveRepoPath(repoName);
    if (!fs.existsSync(repoPath)) return [];

    const results: Array<{ filePath: string; lineMatches: Array<{ line: number; text: string }> }> = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.length === 0 || extensions.includes(ext)) {
            try {
              const fileContent = fs.readFileSync(full, 'utf-8');
              const lines = fileContent.split('\n');
              const matches: Array<{ line: number; text: string }> = [];

              lines.forEach((lineText, idx) => {
                if (lineText.toLowerCase().includes(query.toLowerCase())) {
                  matches.push({ line: idx + 1, text: lineText.trim() });
                }
              });

              if (matches.length > 0) {
                const relPath = path.relative(repoPath, full).replace(/\\/g, '/');
                results.push({ filePath: relPath, lineMatches: matches });
              }
            } catch {
              // Ignore unreadable files
            }
          }
        }
      }
    };

    walk(repoPath);
    return results;
  }

  public cloneAppTemplate(templateName: string, targetAppName: string): {
    success: boolean;
    appDir: string;
    generatedFiles: string[];
  } {
    const appDir = this.ensureRepoDir(targetAppName);
    const generatedFiles: string[] = [];

    // Base package.json
    const packageJson = {
      name: targetAppName.toLowerCase(),
      version: '1.0.0',
      private: true,
      scripts: {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        test: 'vitest run',
        lint: 'eslint .',
        typecheck: 'tsc --noEmit'
      },
      dependencies: {
        '@nstok/db': 'workspace:*',
        '@nstok/ui': 'workspace:*',
        expo: '~52.0.0',
        react: '18.3.1',
        'react-native': '0.76.0',
        'expo-router': '~4.0.0'
      },
      devDependencies: {
        typescript: '^5.3.3',
        '@types/react': '~18.3.12',
        vitest: '^2.1.0'
      }
    };

    this.writeFile(targetAppName, 'package.json', JSON.stringify(packageJson, null, 2));
    generatedFiles.push('package.json');

    // README.md
    const readme = `# ${targetAppName}\n\nGenerated with NSTOK AI Software Factory based on \`${templateName}\`.\n\n## Architecture\n- Reused Features from NSTOK Ecosystem\n- Integrated UI from Nstok-ui\n- Schema and Models from Nstok-db\n`;
    this.writeFile(targetAppName, 'README.md', readme);
    generatedFiles.push('README.md');

    // App layout & entry
    const rootLayout = `import React from 'react';\nimport { Stack } from 'expo-router';\n\nexport default function RootLayout() {\n  return (\n    <Stack screenOptions={{ headerShown: false }}>\n      <Stack.Screen name="(tabs)" />\n    </Stack>\n  );\n}\n`;
    this.writeFile(targetAppName, 'src/app/_layout.tsx', rootLayout);
    generatedFiles.push('src/app/_layout.tsx');

    // Index page
    const indexPage = `import React from 'react';\nimport { View, Text } from 'react-native';\nimport { Button } from '@nstok/ui';\n\nexport default function HomeScreen() {\n  return (\n    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>\n      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome to ${targetAppName}</Text>\n      <Button label="Get Started" variant="primary" />\n    </View>\n  );\n}\n`;
    this.writeFile(targetAppName, 'src/app/index.tsx', indexPage);
    generatedFiles.push('src/app/index.tsx');

    this.auditService.log({
      actor: 'codex',
      action: 'clone_app_template',
      repository: targetAppName,
      status: 'success',
      details: { templateName, targetAppName, filesCount: generatedFiles.length }
    });

    return {
      success: true,
      appDir,
      generatedFiles
    };
  }

  public cloneFeatureTemplate(templateName: string, targetFeatureName: string, description: string): {
    success: boolean;
    featureDir: string;
    generatedFiles: string[];
  } {
    const featureDir = this.ensureRepoDir(targetFeatureName);
    const generatedFiles: string[] = [];

    const packageJson = {
      name: `@nstok/feature-${targetFeatureName.toLowerCase().replace(/^nstok-feature-/, '')}`,
      version: '1.0.0',
      description,
      main: 'src/index.ts',
      scripts: {
        test: 'vitest run',
        typecheck: 'tsc --noEmit'
      },
      dependencies: {
        '@nstok/db': 'workspace:*',
        '@nstok/ui': 'workspace:*',
        react: '18.3.1',
        'react-native': '0.76.0'
      }
    };

    this.writeFile(targetFeatureName, 'package.json', JSON.stringify(packageJson, null, 2));
    generatedFiles.push('package.json');

    const indexFile = `export * from './components/index.js';\nexport * from './services/index.js';\nexport * from './types/index.js';\n`;
    this.writeFile(targetFeatureName, 'src/index.ts', indexFile);
    generatedFiles.push('src/index.ts');

    const componentIndex = `import React from 'react';\nimport { View, Text } from 'react-native';\nimport { Button, Card } from '@nstok/ui';\n\nexport const ${targetFeatureName.replace(/[^a-zA-Z0-9]/g, '')}View: React.FC = () => {\n  return (\n    <Card title="${targetFeatureName}">\n      <Text>Feature component initialized from ${templateName}</Text>\n      <Button label="Execute Action" />\n    </Card>\n  );\n};\n`;
    this.writeFile(targetFeatureName, 'src/components/index.tsx', componentIndex);
    generatedFiles.push('src/components/index.tsx');

    this.auditService.log({
      actor: 'codex',
      action: 'clone_feature_template',
      repository: targetFeatureName,
      status: 'success',
      details: { templateName, targetFeatureName, filesCount: generatedFiles.length }
    });

    return {
      success: true,
      featureDir,
      generatedFiles
    };
  }
}
