export interface Application {
  id: string;
  name: string; // e.g. 'Nstok-app-w'
  template: string; // e.g. 'Nstok-app-template'
  description: string;
  reusedFeatures: string[];
  adaptedFeatures?: Array<{
    featureId: string;
    description: string;
  }>;
  newFeatures: string[];
  uiComponents: string[];
  dbEntities: string[];
  status: 'planning' | 'generated' | 'validated' | 'active';
  branchName?: string;
  pullRequestUrl?: string;
  createdAt: string;
  updatedAt: string;
}
