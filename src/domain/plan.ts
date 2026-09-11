export interface PlanStep {
  stepNumber: number;
  title: string;
  action: string;
  details: string;
  targetRepository?: string;
}

export interface AppPlan {
  app: string;
  template: string;
  requiredCapabilities: string[];
  reuse: string[];
  adaptedFeatures?: Array<{
    feature: string;
    adaptation: string;
  }>;
  newFeatures: string[];
  ui: string[];
  database: string[];
  steps?: PlanStep[];
  architectureRulesApplied?: string[];
  risks?: string[];
}

export interface FeaturePlan {
  featureName: string;
  repository: string;
  template: string; // e.g. 'Nstok-feature-template'
  description: string;
  capabilities: string[];
  dependencies: string[];
  uiComponents: string[];
  dbEntities: string[];
  steps: PlanStep[];
}

export interface PRDAnalysisResult {
  appName: string;
  description: string;
  targetIndustry?: string;
  extractedCapabilities: string[];
  exactFeatureMatches: string[];
  adaptableFeatures: Array<{
    feature: string;
    missingCapabilities: string[];
    adaptationStrategy: string;
  }>;
  missingFeatures: string[];
  recommendedUIComponents: string[];
  recommendedDBEntities: string[];
  suggestedTemplate: string;
  reuseScore: number; // e.g. 80% reuse
}
