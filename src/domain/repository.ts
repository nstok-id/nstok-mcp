export type RepositoryType =
  | 'db'
  | 'ui'
  | 'feature'
  | 'app'
  | 'template'
  | 'knowledge';

export type RepositoryStatus = 'stable' | 'active' | 'deprecated' | 'experimental';

export interface RepositoryMetadata {
  id: string;
  name: string;
  type: RepositoryType;
  version: string;
  status: RepositoryStatus;
  url?: string;
  description: string;
  stack: string[];
  dependencies: string[];
  provides: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type AssetType =
  | 'feature'
  | 'ui_component'
  | 'db_entity'
  | 'api'
  | 'template'
  | 'pattern'
  | 'dependency'
  | 'repository'
  | 'application';

export type RelationshipType =
  | 'CONTAINS'
  | 'USES'
  | 'DEPENDS_ON'
  | 'BASED_ON'
  | 'IMPLEMENTED_IN'
  | 'BELONGS_TO';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  metadata?: Record<string, unknown>;
}

export interface Asset {
  id: string;
  repositoryId: string;
  type: AssetType;
  name: string;
  path: string;
  description: string;
  version: string;
  status: RepositoryStatus;
  metadata?: Record<string, unknown>;
}
