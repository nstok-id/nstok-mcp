export interface DBField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface DBRelation {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  targetEntity: string;
  foreignKey: string;
}

export interface DBEntity {
  id: string;
  name: string;
  repository: string; // e.g. 'Nstok-db'
  tableName: string;
  description: string;
  fields: DBField[];
  relations: DBRelation[];
  indexes?: string[];
  sourcePath: string;
}
