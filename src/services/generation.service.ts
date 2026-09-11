import { KnowledgeService } from './knowledge.service.js';
import { RepositoryService } from './repository.service.js';
import { AppPlan, FeaturePlan, PRDAnalysisResult, PlanStep } from '../domain/plan.js';
import { config } from '../config/environment.js';

export class GenerationService {
  private static instance: GenerationService;
  private knowledgeService: KnowledgeService;
  private repoService: RepositoryService;

  private constructor() {
    this.knowledgeService = KnowledgeService.getInstance();
    this.repoService = RepositoryService.getInstance();
  }

  public static getInstance(): GenerationService {
    if (!GenerationService.instance) {
      GenerationService.instance = new GenerationService();
    }
    return GenerationService.instance;
  }

  /**
   * Analyzes raw PRD, extracts capabilities, and runs the Reuse Decision Engine
   */
  public analyzePRD(appName: string, prdContent: string): PRDAnalysisResult {
    const lines = prdContent.toLowerCase().split('\n').map(l => l.trim()).filter(Boolean);
    
    // Extract keywords and capabilities
    const capabilityKeywords = [
      'authentication', 'auth', 'login', 'jwt', 'rbac', 'user', 'session',
      'product', 'catalog', 'category', 'pricing', 'sku', 'barcode',
      'inventory', 'stock', 'warehouse', 'stock-in', 'stock-out', 'adjustment',
      'checkout', 'cart', 'order', 'receipt',
      'payment', 'qris', 'cash', 'card',
      'sales-report', 'sales report', 'report', 'analytics', 'dashboard', 'revenue',
      'customer', 'loyalty', 'promo', 'discount',
      'table-management', 'kitchen-display', 'kds', 'printer', 'bluetooth-printer'
    ];

    const extractedCaps = new Set<string>();
    for (const kw of capabilityKeywords) {
      if (prdContent.toLowerCase().includes(kw)) {
        extractedCaps.add(kw.replace(/\s+/g, '-'));
      }
    }

    const requiredCaps = Array.from(extractedCaps);
    const exactMatches: string[] = [];
    const adaptableMatches: Array<{ feature: string; missingCapabilities: string[]; adaptationStrategy: string }> = [];
    const missingFeatures: string[] = [];

    // Evaluate features using the REUSE FIRST principle
    const allFeatures = this.knowledgeService.findFeatures();

    const coveredCaps = new Set<string>();

    for (const feat of allFeatures) {
      const matched = feat.capabilities.filter(c =>
        requiredCaps.some(req => req.includes(c) || c.includes(req))
      );

      if (matched.length > 0) {
        matched.forEach(c => coveredCaps.add(c));
        if (matched.length === feat.capabilities.length || matched.length >= 2) {
          exactMatches.push(feat.repository);
        } else {
          adaptableMatches.push({
            feature: feat.repository,
            missingCapabilities: feat.capabilities.filter(c => !matched.includes(c)),
            adaptationStrategy: `Extend ${feat.name} with custom wrapper or config options.`
          });
        }
      }
    }

    // Identify features not found in registry
    for (const cap of requiredCaps) {
      let isCovered = false;
      for (const feat of allFeatures) {
        if (feat.capabilities.some(c => c.includes(cap) || cap.includes(c))) {
          isCovered = true;
          break;
        }
      }
      if (!isCovered) {
        missingFeatures.push(cap);
      }
    }

    // Recommended UI components from Nstok-ui based on capabilities
    const recommendedUI = new Set<string>();
    recommendedUI.add('Button');
    recommendedUI.add('SearchInput');
    if (requiredCaps.some(c => c.includes('product') || c.includes('catalog'))) {
      recommendedUI.add('ProductTable');
      recommendedUI.add('DataTable');
      recommendedUI.add('Badge');
    }
    if (requiredCaps.some(c => c.includes('inventory') || c.includes('stock'))) {
      recommendedUI.add('DataTable');
      recommendedUI.add('FilterSheet');
      recommendedUI.add('EmptyState');
    }
    if (requiredCaps.some(c => c.includes('checkout') || c.includes('payment') || c.includes('auth'))) {
      recommendedUI.add('Modal');
      recommendedUI.add('Card');
      recommendedUI.add('LoadingState');
    }

    // Recommended DB entities from Nstok-db
    const recommendedDB = new Set<string>();
    if (requiredCaps.some(c => c.includes('auth') || c.includes('user') || c.includes('login'))) {
      recommendedDB.add('User');
      recommendedDB.add('Role');
    }
    if (requiredCaps.some(c => c.includes('product') || c.includes('catalog'))) {
      recommendedDB.add('Product');
      recommendedDB.add('Category');
    }
    if (requiredCaps.some(c => c.includes('inventory') || c.includes('stock'))) {
      recommendedDB.add('Inventory');
      recommendedDB.add('StockMovement');
      recommendedDB.add('Warehouse');
    }
    if (requiredCaps.some(c => c.includes('checkout') || c.includes('payment') || c.includes('order') || c.includes('sales'))) {
      recommendedDB.add('Sale');
      recommendedDB.add('SaleItem');
      recommendedDB.add('Payment');
    }

    const totalCapabilitiesCount = Math.max(requiredCaps.length, 1);
    const reusedCount = coveredCaps.size;
    const reuseScore = Math.min(100, Math.round((reusedCount / totalCapabilitiesCount) * 100));

    return {
      appName,
      description: `Analysis for ${appName} based on PRD requirements.`,
      extractedCapabilities: requiredCaps,
      exactFeatureMatches: Array.from(new Set(exactMatches)),
      adaptableFeatures: adaptableMatches,
      missingFeatures: Array.from(new Set(missingFeatures)),
      recommendedUIComponents: Array.from(recommendedUI),
      recommendedDBEntities: Array.from(recommendedDB),
      suggestedTemplate: config.defaultAppTemplate,
      reuseScore
    };
  }

  /**
   * Generates a structured implementation plan following Section 7.2 of Technical Architecture
   */
  public createAppPlan(appName: string, prdContent: string, customTemplate?: string): AppPlan {
    const analysis = this.analyzePRD(appName, prdContent);
    const template = customTemplate || config.defaultAppTemplate;

    const steps: PlanStep[] = [
      {
        stepNumber: 1,
        title: 'Clone Base Application Template',
        action: 'clone_app_template',
        details: `Clone ${template} to initialize ${appName} with standard directory layout, Expo routing, and TypeScript config.`
      },
      {
        stepNumber: 2,
        title: 'Wire Reused Features',
        action: 'add_feature_to_app',
        details: `Link existing features: ${analysis.exactFeatureMatches.join(', ')} into ${appName}.`
      }
    ];

    if (analysis.missingFeatures.length > 0) {
      analysis.missingFeatures.forEach((missing, idx) => {
        const featureRepoName = `Nstok-feature-${missing.toLowerCase()}`;
        steps.push({
          stepNumber: steps.length + 1,
          title: `Scaffold Missing Feature: ${missing}`,
          action: 'create_feature',
          targetRepository: featureRepoName,
          details: `Generate ${featureRepoName} from ${config.defaultFeatureTemplate} to satisfy '${missing}' capability.`
        });
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Integrate UI Components & Database Schema',
      action: 'integrate_ui_and_db',
      details: `Import shared UI components (${analysis.recommendedUIComponents.join(', ')}) from Nstok-ui and Drizzle entities (${analysis.recommendedDBEntities.join(', ')}) from Nstok-db.`
    });

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Validate Architecture & Run Test Suite',
      action: 'validate_architecture',
      details: 'Run typecheck, linting, unit tests, and verify NSTOK architecture compliance (UI-001, DB-001).'
    });

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Create Git Pull Request',
      action: 'create_pull_request',
      details: `Submit branch feature/ai/create-${appName.toLowerCase()} for human review.`
    });

    steps.push({
      stepNumber: steps.length + 1,
      title: 'Update Central Knowledge Graph',
      action: 'update_knowledge',
      details: `Ingest ${appName} and new features into Nstok-knowledge-master for future reuse.`
    });

    return {
      app: appName,
      template,
      requiredCapabilities: analysis.extractedCapabilities,
      reuse: analysis.exactFeatureMatches,
      adaptedFeatures: analysis.adaptableFeatures.map(a => ({ feature: a.feature, adaptation: a.adaptationStrategy })),
      newFeatures: analysis.missingFeatures,
      ui: analysis.recommendedUIComponents,
      database: analysis.recommendedDBEntities,
      steps,
      architectureRulesApplied: [
        'UI-001: All UI components imported from Nstok-ui',
        'DB-001: Schema managed via Nstok-db',
        'ARCH-001: New features scaffolded from Nstok-feature-template',
        'DEP-001: Strict dependency allowlist validation'
      ],
      risks: analysis.missingFeatures.length > 0 ? [`${analysis.missingFeatures.length} new features need implementation.`] : []
    };
  }

  /**
   * Generates a feature implementation plan for scaffolding new features
   */
  public createFeaturePlan(featureName: string, capabilities: string[]): FeaturePlan {
    const repoName = featureName.startsWith('Nstok-feature-') ? featureName : `Nstok-feature-${featureName.toLowerCase()}`;
    const template = config.defaultFeatureTemplate;

    const steps: PlanStep[] = [
      {
        stepNumber: 1,
        title: 'Clone Feature Template',
        action: 'clone_feature_template',
        details: `Clone ${template} into ${repoName}.`
      },
      {
        stepNumber: 2,
        title: 'Implement Domain Logic & APIs',
        action: 'implement_domain_logic',
        details: `Implement business capabilities: ${capabilities.join(', ')}.`
      },
      {
        stepNumber: 3,
        title: 'Integrate Nstok-ui and Nstok-db',
        action: 'integrate_ui_db',
        details: 'Connect component views with Nstok-ui design tokens and entities with Nstok-db schemas.'
      },
      {
        stepNumber: 4,
        title: 'Run Tests & Linting',
        action: 'run_tests',
        details: 'Execute unit tests and static validation.'
      },
      {
        stepNumber: 5,
        title: 'Register in Central Knowledge',
        action: 'update_knowledge',
        details: `Register ${repoName} in Nstok-knowledge-master feature registry.`
      }
    ];

    return {
      featureName,
      repository: repoName,
      template,
      description: `Feature module for ${capabilities.join(', ')}`,
      capabilities,
      dependencies: ['Nstok-ui', 'Nstok-db'],
      uiComponents: ['Button', 'Card', 'DataTable'],
      dbEntities: ['AuditLog'],
      steps
    };
  }

  /**
   * Scaffolds and generates the application end-to-end
   */
  public createApp(appName: string, prd: string, template?: string): {
    app: string;
    template: string;
    plan: AppPlan;
    filesCreated: string[];
    createdNewFeatures: string[];
  } {
    const plan = this.createAppPlan(appName, prd, template);
    const filesCreated: string[] = [];
    const createdNewFeatures: string[] = [];

    // Step 1: Clone app template
    const appResult = this.repoService.cloneAppTemplate(plan.template, appName);
    filesCreated.push(...appResult.generatedFiles);

    // Step 2: Create new features if needed
    for (const newFeat of plan.newFeatures) {
      const featRepoName = `Nstok-feature-${newFeat.toLowerCase()}`;
      const featResult = this.repoService.cloneFeatureTemplate(
        config.defaultFeatureTemplate,
        featRepoName,
        `New feature module providing ${newFeat}`
      );
      createdNewFeatures.push(featRepoName);
      filesCreated.push(...featResult.generatedFiles.map(f => `${featRepoName}/${f}`));
    }

    // Step 3: Write application composition file
    const compositionCode = `// Generated by NSTOK AI Software Factory\nimport { ApplicationComposition } from '@nstok/core';\n\nexport const AppConfig = {\n  name: '${appName}',\n  reusedFeatures: ${JSON.stringify(plan.reuse, null, 2)},\n  newFeatures: ${JSON.stringify(plan.newFeatures, null, 2)},\n  uiComponents: ${JSON.stringify(plan.ui, null, 2)},\n  dbEntities: ${JSON.stringify(plan.database, null, 2)}\n};\n`;
    this.repoService.writeFile(appName, 'src/config/app.config.ts', compositionCode);
    filesCreated.push('src/config/app.config.ts');

    return {
      app: appName,
      template: plan.template,
      plan,
      filesCreated,
      createdNewFeatures
    };
  }
}
