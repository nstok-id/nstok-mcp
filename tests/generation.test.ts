import { describe, it, expect } from 'vitest';
import { GenerationService } from '../src/services/generation.service.js';

describe('GenerationService', () => {
  const service = GenerationService.getInstance();

  const samplePRD = `
    Build nstok-app-w.
    Key capabilities:
    - POS cashier workflow
    - authentication and user login
    - product management and catalog
    - inventory and stock movement
    - checkout and payment processing
    - sales report and daily analytics
  `;

  it('should analyze PRD and prioritize reuse over creation', () => {
    const analysis = service.analyzePRD('Nstok-app-w', samplePRD);

    expect(analysis.appName).toBe('Nstok-app-w');
    expect(analysis.extractedCapabilities.length).toBeGreaterThan(0);
    
    // Existing features should be identified for reuse
    expect(analysis.exactFeatureMatches).toContain('Nstok-feature-a');
    expect(analysis.exactFeatureMatches).toContain('Nstok-feature-b');
    expect(analysis.exactFeatureMatches).toContain('Nstok-feature-c');

    // Missing feature should be identified
    expect(analysis.missingFeatures.some(f => f.includes('sales-report') || f.includes('report'))).toBe(true);

    // Reuse score should be high
    expect(analysis.reuseScore).toBeGreaterThan(50);
  });

  it('should generate structured AppPlan following Section 7.2 architecture format', () => {
    const plan = service.createAppPlan('Nstok-app-w', samplePRD);

    expect(plan.app).toBe('Nstok-app-w');
    expect(plan.template).toBe('Nstok-app-template');
    expect(plan.reuse).toContain('Nstok-feature-a');
    expect(plan.reuse).toContain('Nstok-feature-b');
    expect(plan.reuse).toContain('Nstok-feature-c');
    expect(plan.ui).toContain('ProductTable');
    expect(plan.ui).toContain('SearchInput');
    expect(plan.database).toContain('Product');
    expect(plan.database).toContain('Inventory');
    expect(plan.database).toContain('Sale');
    expect(plan.steps?.length).toBeGreaterThan(0);
  });

  it('should generate feature plan scaffolded from Nstok-feature-template', () => {
    const featPlan = service.createFeaturePlan('sales-report', ['daily-summary', 'revenue-analytics']);

    expect(featPlan.featureName).toBe('sales-report');
    expect(featPlan.repository).toBe('Nstok-feature-sales-report');
    expect(featPlan.template).toBe('Nstok-feature-template');
    expect(featPlan.capabilities).toContain('daily-summary');
  });
});
