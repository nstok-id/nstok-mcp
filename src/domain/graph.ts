import { AssetType, RelationshipType } from './repository.js';

export interface GraphNode {
  id: string;
  label: string;
  type: AssetType;
  description?: string;
  repository?: string;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string; // Source Node ID
  target: string; // Target Node ID
  relationship: RelationshipType;
  metadata?: Record<string, unknown>;
}

export interface GraphTraversalResult {
  node: GraphNode;
  directDependencies: GraphNode[];
  usedUIComponents: GraphNode[];
  usedDBEntities: GraphNode[];
  dependentFeatures: GraphNode[];
  parentRepository?: GraphNode;
  templateBasis?: GraphNode;
}
