import { RepositoryMetadata, AssetType } from '../domain/repository.js';
import { Feature } from '../domain/feature.js';
import { UIComponent } from '../domain/component.js';
import { DBEntity } from '../domain/database.js';
import { GraphNode, GraphEdge, GraphTraversalResult } from '../domain/graph.js';
import {
  SEED_REPOSITORIES,
  SEED_FEATURES,
  SEED_UI_COMPONENTS,
  SEED_DB_ENTITIES,
  SEED_PATTERNS,
  generateSeedGraph
} from '../data/seed.js';

export class KnowledgeService {
  private static instance: KnowledgeService;

  private repositories: Map<string, RepositoryMetadata> = new Map();
  private features: Map<string, Feature> = new Map();
  private uiComponents: Map<string, UIComponent> = new Map();
  private dbEntities: Map<string, DBEntity> = new Map();
  private patterns: Map<string, typeof SEED_PATTERNS[0]> = new Map();
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  private constructor() {
    this.initializeSeedData();
  }

  public static getInstance(): KnowledgeService {
    if (!KnowledgeService.instance) {
      KnowledgeService.instance = new KnowledgeService();
    }
    return KnowledgeService.instance;
  }

  private initializeSeedData() {
    for (const repo of SEED_REPOSITORIES) {
      this.repositories.set(repo.name.toLowerCase(), repo);
    }
    for (const feat of SEED_FEATURES) {
      this.features.set(feat.id.toLowerCase(), feat);
    }
    for (const ui of SEED_UI_COMPONENTS) {
      this.uiComponents.set(ui.name.toLowerCase(), ui);
    }
    for (const db of SEED_DB_ENTITIES) {
      this.dbEntities.set(db.name.toLowerCase(), db);
    }
    for (const pat of SEED_PATTERNS) {
      this.patterns.set(pat.id.toLowerCase(), pat);
    }

    const { nodes, edges } = generateSeedGraph();
    for (const node of nodes) {
      this.nodes.set(node.id.toLowerCase(), node);
    }
    this.edges = [...edges];
  }

  /**
   * Hybrid semantic / keyword search over all NSTOK knowledge assets
   */
  public searchKnowledge(query: string, filter?: { type?: AssetType; repository?: string }): Array<{
    score: number;
    type: AssetType;
    id: string;
    title: string;
    description: string;
    repository?: string;
    snippet: Record<string, unknown>;
  }> {
    const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: Array<{
      score: number;
      type: AssetType;
      id: string;
      title: string;
      description: string;
      repository?: string;
      snippet: Record<string, unknown>;
    }> = [];

    const calculateScore = (text: string, weight = 1): number => {
      if (!text) return 0;
      const lower = text.toLowerCase();
      let matched = 0;
      for (const token of qTokens) {
        if (lower === token) matched += 3;
        else if (lower.includes(token)) matched += 1;
      }
      return matched * weight;
    };

    // 1. Search Features
    if (!filter?.type || filter.type === 'feature') {
      for (const feat of this.features.values()) {
        if (filter?.repository && feat.repository.toLowerCase() !== filter.repository.toLowerCase()) continue;

        let score = calculateScore(feat.name, 3) + calculateScore(feat.description, 2);
        for (const cap of feat.capabilities) {
          score += calculateScore(cap, 2.5);
        }

        if (score > 0 || qTokens.length === 0) {
          results.push({
            score: score || 1,
            type: 'feature',
            id: feat.id,
            title: feat.name,
            description: feat.description,
            repository: feat.repository,
            snippet: {
              capabilities: feat.capabilities,
              dependencies: feat.dependencies,
              uiComponents: feat.uiComponents,
              dbEntities: feat.dbEntities
            }
          });
        }
      }
    }

    // 2. Search UI Components
    if (!filter?.type || filter.type === 'ui_component') {
      for (const ui of this.uiComponents.values()) {
        if (filter?.repository && ui.repository.toLowerCase() !== filter.repository.toLowerCase()) continue;

        let score = calculateScore(ui.name, 3) + calculateScore(ui.description, 2) + calculateScore(ui.category, 1.5);
        for (const prop of ui.props) {
          score += calculateScore(prop.name, 1);
        }

        if (score > 0 || qTokens.length === 0) {
          results.push({
            score: score || 1,
            type: 'ui_component',
            id: ui.id,
            title: ui.name,
            description: ui.description,
            repository: ui.repository,
            snippet: {
              category: ui.category,
              props: ui.props,
              usedBy: ui.usedBy,
              sourcePath: ui.sourcePath
            }
          });
        }
      }
    }

    // 3. Search DB Entities
    if (!filter?.type || filter.type === 'db_entity') {
      for (const db of this.dbEntities.values()) {
        if (filter?.repository && db.repository.toLowerCase() !== filter.repository.toLowerCase()) continue;

        let score = calculateScore(db.name, 3) + calculateScore(db.description, 2) + calculateScore(db.tableName, 2);
        for (const field of db.fields) {
          score += calculateScore(field.name, 1);
        }

        if (score > 0 || qTokens.length === 0) {
          results.push({
            score: score || 1,
            type: 'db_entity',
            id: db.id,
            title: db.name,
            description: db.description,
            repository: db.repository,
            snippet: {
              tableName: db.tableName,
              fieldsCount: db.fields.length,
              relations: db.relations.map(r => `${r.name} -> ${r.targetEntity}`)
            }
          });
        }
      }
    }

    // 4. Search Patterns
    if (!filter?.type || filter.type === 'pattern') {
      for (const pat of this.patterns.values()) {
        const score = calculateScore(pat.name, 3) + calculateScore(pat.description, 2) + calculateScore(pat.category, 1.5);
        if (score > 0 || qTokens.length === 0) {
          results.push({
            score: score || 1,
            type: 'pattern',
            id: pat.id,
            title: pat.name,
            description: pat.description,
            snippet: {
              category: pat.category,
              codeSample: pat.codeSample
            }
          });
        }
      }
    }

    // 5. Search Repositories
    if (!filter?.type || filter.type === 'repository') {
      for (const repo of this.repositories.values()) {
        let score = calculateScore(repo.name, 3) + calculateScore(repo.description, 2);
        for (const prov of repo.provides) score += calculateScore(prov, 2);

        if (score > 0 || qTokens.length === 0) {
          results.push({
            score: score || 1,
            type: 'repository',
            id: repo.id,
            title: repo.name,
            description: repo.description,
            repository: repo.name,
            snippet: {
              type: repo.type,
              version: repo.version,
              stack: repo.stack,
              provides: repo.provides
            }
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  public findFeatures(query?: string, capabilities?: string[]): Feature[] {
    const list = Array.from(this.features.values());
    if (!query && (!capabilities || capabilities.length === 0)) {
      return list;
    }

    return list.filter(feat => {
      if (capabilities && capabilities.length > 0) {
        const hasCap = capabilities.some(reqCap =>
          feat.capabilities.some(c => c.toLowerCase().includes(reqCap.toLowerCase()) || reqCap.toLowerCase().includes(c.toLowerCase()))
        );
        if (hasCap) return true;
      }
      if (query) {
        const q = query.toLowerCase();
        return (
          feat.name.toLowerCase().includes(q) ||
          feat.description.toLowerCase().includes(q) ||
          feat.capabilities.some(c => c.toLowerCase().includes(q))
        );
      }
      return false;
    });
  }

  public findUIComponents(query?: string, category?: string): UIComponent[] {
    let list = Array.from(this.uiComponents.values());
    if (category) {
      list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.props.some(p => p.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public findDBEntities(query?: string): DBEntity[] {
    const list = Array.from(this.dbEntities.values());
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.tableName.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.fields.some(f => f.name.toLowerCase().includes(q))
    );
  }

  public findPatterns(query?: string, category?: string): Array<typeof SEED_PATTERNS[0]> {
    let list = Array.from(this.patterns.values());
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getProjectContext(repoName: string): {
    repository: RepositoryMetadata | null;
    containedAssets: {
      features: Feature[];
      uiComponents: UIComponent[];
      dbEntities: DBEntity[];
    };
    relatedEdges: GraphEdge[];
  } {
    const repo = this.repositories.get(repoName.toLowerCase()) || null;
    const features = Array.from(this.features.values()).filter(f => f.repository.toLowerCase() === repoName.toLowerCase());
    const uiComponents = Array.from(this.uiComponents.values()).filter(u => u.repository.toLowerCase() === repoName.toLowerCase());
    const dbEntities = Array.from(this.dbEntities.values()).filter(d => d.repository.toLowerCase() === repoName.toLowerCase());

    const relatedEdges = this.edges.filter(e =>
      e.source.toLowerCase() === repoName.toLowerCase() || e.target.toLowerCase() === repoName.toLowerCase()
    );

    return {
      repository: repo,
      containedAssets: {
        features,
        uiComponents,
        dbEntities
      },
      relatedEdges
    };
  }

  public getFeatureContext(featureId: string): {
    feature: Feature | null;
    traversal: GraphTraversalResult | null;
  } {
    const feat = this.features.get(featureId.toLowerCase()) || null;
    if (!feat) return { feature: null, traversal: null };

    const traversal = this.traverseGraph(feat.id);
    return {
      feature: feat,
      traversal
    };
  }

  public getAppContext(appName: string): {
    app: RepositoryMetadata | null;
    reusedFeatures: Feature[];
    traversal: GraphTraversalResult | null;
  } {
    const repo = this.repositories.get(appName.toLowerCase()) || null;
    const traversal = this.traverseGraph(appName);
    const reusedFeatures = traversal ? traversal.directDependencies.map(d => this.features.get(d.id.toLowerCase())!).filter(Boolean) : [];

    return {
      app: repo,
      reusedFeatures,
      traversal
    };
  }

  public traverseGraph(nodeId: string): GraphTraversalResult | null {
    const node = this.nodes.get(nodeId.toLowerCase());
    if (!node) return null;

    const directDependencies: GraphNode[] = [];
    const usedUIComponents: GraphNode[] = [];
    const usedDBEntities: GraphNode[] = [];
    const dependentFeatures: GraphNode[] = [];
    let parentRepository: GraphNode | undefined;
    let templateBasis: GraphNode | undefined;

    for (const edge of this.edges) {
      if (edge.source.toLowerCase() === nodeId.toLowerCase()) {
        const targetNode = this.nodes.get(edge.target.toLowerCase());
        if (!targetNode) continue;

        if (edge.relationship === 'DEPENDS_ON') {
          directDependencies.push(targetNode);
        } else if (edge.relationship === 'USES') {
          if (targetNode.type === 'ui_component') usedUIComponents.push(targetNode);
          else if (targetNode.type === 'db_entity') usedDBEntities.push(targetNode);
          else if (targetNode.type === 'feature') directDependencies.push(targetNode);
        } else if (edge.relationship === 'IMPLEMENTED_IN' || edge.relationship === 'BELONGS_TO') {
          parentRepository = targetNode;
        } else if (edge.relationship === 'BASED_ON') {
          templateBasis = targetNode;
        }
      } else if (edge.target.toLowerCase() === nodeId.toLowerCase()) {
        const sourceNode = this.nodes.get(edge.source.toLowerCase());
        if (!sourceNode) continue;

        if (edge.relationship === 'DEPENDS_ON' || edge.relationship === 'USES') {
          if (sourceNode.type === 'feature' || sourceNode.type === 'application') {
            dependentFeatures.push(sourceNode);
          }
        }
      }
    }

    return {
      node,
      directDependencies,
      usedUIComponents,
      usedDBEntities,
      dependentFeatures,
      parentRepository,
      templateBasis
    };
  }

  public updateKnowledge(asset: {
    type: AssetType;
    id: string;
    name: string;
    repository: string;
    description: string;
    metadata: Record<string, unknown>;
    relationships?: Array<{ targetId: string; relationship: string }>;
  }): { success: boolean; message: string } {
    const nodeId = asset.id.toLowerCase();

    // Register node
    const node: GraphNode = {
      id: asset.id,
      label: asset.name,
      type: asset.type,
      description: asset.description,
      repository: asset.repository,
      metadata: asset.metadata
    };
    this.nodes.set(nodeId, node);

    // If feature, register in feature registry
    if (asset.type === 'feature') {
      const feat: Feature = {
        id: asset.id,
        name: asset.name,
        repository: asset.repository,
        status: 'active',
        version: (asset.metadata.version as string) || '1.0.0',
        description: asset.description,
        capabilities: (asset.metadata.capabilities as string[]) || [],
        dependencies: (asset.metadata.dependencies as string[]) || [],
        uiComponents: (asset.metadata.uiComponents as string[]) || [],
        dbEntities: (asset.metadata.dbEntities as string[]) || []
      };
      this.features.set(feat.id.toLowerCase(), feat);
    } else if (asset.type === 'ui_component') {
      const ui: UIComponent = {
        id: asset.id,
        name: asset.name,
        repository: asset.repository,
        category: (asset.metadata.category as UIComponent['category']) || 'layout',
        description: asset.description,
        props: (asset.metadata.props as any) || [],
        dependencies: (asset.metadata.dependencies as string[]) || [],
        usedBy: (asset.metadata.usedBy as string[]) || [],
        sourcePath: (asset.metadata.sourcePath as string) || '',
        exportName: asset.name
      };
      this.uiComponents.set(ui.name.toLowerCase(), ui);
    } else if (asset.type === 'application' || asset.type === 'repository') {
      const repo: RepositoryMetadata = {
        id: asset.id,
        name: asset.name,
        type: asset.type === 'application' ? 'app' : (asset.metadata.type as any) || 'feature',
        version: (asset.metadata.version as string) || '1.0.0',
        status: 'active',
        description: asset.description,
        stack: (asset.metadata.stack as string[]) || ['typescript', 'react-native'],
        dependencies: (asset.metadata.dependencies as string[]) || [],
        provides: (asset.metadata.provides as string[]) || []
      };
      this.repositories.set(repo.name.toLowerCase(), repo);
    }

    // Register relationships
    if (asset.relationships && asset.relationships.length > 0) {
      for (const rel of asset.relationships) {
        this.edges.push({
          id: `${asset.id}-${rel.relationship}-${rel.targetId}`,
          source: asset.id,
          target: rel.targetId,
          relationship: rel.relationship as any
        });
      }
    }

    return {
      success: true,
      message: `Knowledge updated successfully for ${asset.type} [${asset.id}]. New relationships added.`
    };
  }

  public getAllRepositories(): RepositoryMetadata[] {
    return Array.from(this.repositories.values());
  }
}
