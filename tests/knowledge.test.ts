import { describe, it, expect } from 'vitest';
import { KnowledgeService } from '../src/services/knowledge.service.js';

describe('KnowledgeService', () => {
  const service = KnowledgeService.getInstance();

  it('should find features by capability keyword', () => {
    const results = service.findFeatures('inventory');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(f => f.repository === 'Nstok-feature-c')).toBe(true);
  });

  it('should find UI components from Nstok-ui', () => {
    const components = service.findUIComponents('Table');
    expect(components.length).toBeGreaterThan(0);
    expect(components.some(c => c.name === 'DataTable')).toBe(true);
    expect(components.some(c => c.name === 'ProductTable')).toBe(true);
  });

  it('should find DB entities from Nstok-db', () => {
    const entities = service.findDBEntities('Product');
    expect(entities.length).toBeGreaterThan(0);
    expect(entities.some(e => e.name === 'Product')).toBe(true);
  });

  it('should perform hybrid search across all asset types', () => {
    const searchResults = service.searchKnowledge('POS');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].score).toBeGreaterThan(0);
  });

  it('should traverse knowledge graph relationships', () => {
    const traversal = service.traverseGraph('inventory-management');
    expect(traversal).not.toBeNull();
    expect(traversal?.node.id).toBe('inventory-management');
    expect(traversal?.directDependencies.length).toBeGreaterThan(0);
    expect(traversal?.usedUIComponents.length).toBeGreaterThan(0);
    expect(traversal?.usedDBEntities.length).toBeGreaterThan(0);
  });

  it('should dynamically update knowledge graph with new assets', () => {
    const updateResult = service.updateKnowledge({
      type: 'feature',
      id: 'sales-report-feature',
      name: 'Sales Report',
      repository: 'Nstok-feature-sales-report',
      description: 'Daily and weekly sales analytics',
      metadata: {
        capabilities: ['sales-report', 'revenue-analytics'],
        uiComponents: ['DataTable'],
        dbEntities: ['Sale']
      },
      relationships: [
        { targetId: 'Nstok-feature-template', relationship: 'BASED_ON' },
        { targetId: 'DataTable', relationship: 'USES' },
        { targetId: 'Sale', relationship: 'USES' }
      ]
    });

    expect(updateResult.success).toBe(true);

    const found = service.findFeatures('sales-report');
    expect(found.some(f => f.id === 'sales-report-feature')).toBe(true);
  });
});
