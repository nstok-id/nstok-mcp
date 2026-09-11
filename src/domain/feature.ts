export interface Capability {
  id: string;
  name: string;
  category: string;
  description: string;
  synonyms?: string[];
}

export interface Feature {
  id: string;
  name: string;
  repository: string;
  status: 'stable' | 'active' | 'deprecated' | 'experimental';
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  uiComponents: string[];
  dbEntities: string[];
  routes?: string[];
  apis?: string[];
  exports?: string[];
  configOptions?: Record<string, unknown>;
}

export interface FeatureMatch {
  feature: Feature;
  matchType: 'exact' | 'adapt' | 'none';
  matchScore: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  adaptationNotes?: string;
}
