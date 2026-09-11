import { describe, it, expect } from 'vitest';
import { ValidationService } from '../src/services/validation.service.js';
import { RepositoryService } from '../src/services/repository.service.js';

describe('ValidationService', () => {
  const valService = ValidationService.getInstance();
  const repoService = RepositoryService.getInstance();

  it('should validate clean architecture without violations', () => {
    const cleanApp = 'Nstok-app-clean-test';
    repoService.cloneAppTemplate('Nstok-app-template', cleanApp);
    const result = valService.validateArchitecture(cleanApp);

    expect(result.valid).toBe(true);
    expect(result.violations.filter(v => v.severity === 'error').length).toBe(0);
  });

  it('should catch UI-001 violation when duplicate UI component is created', () => {
    const violationApp = 'Nstok-app-violation-test';
    repoService.cloneAppTemplate('Nstok-app-template', violationApp);
    // Inject duplicate Button component
    repoService.writeFile(violationApp, 'src/components/Button.tsx', 'export function Button() { return <div />; }', { overwrite: true });
    const result = valService.validateArchitecture(violationApp);

    expect(result.valid).toBe(false);
    expect(result.violations.some(v => v.rule === 'UI-001')).toBe(true);
  });

  it('should run build and test jobs', () => {
    const jobApp = 'Nstok-app-jobs-test';
    repoService.cloneAppTemplate('Nstok-app-template', jobApp);

    const testResult = valService.runTests(jobApp);
    expect(testResult.jobId).toBeDefined();
    expect(testResult.durationMs).toBeGreaterThan(0);

    const buildResult = valService.runBuild(jobApp);
    expect(buildResult.jobId).toBeDefined();
  });
});
