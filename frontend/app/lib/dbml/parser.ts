import { Parser, ModelExporter, importer } from '@dbml/core';
import type { Node, Edge } from '@xyflow/react';

export interface DBMLColumn {
  name: string;
  type: string;
  pk: boolean;
  unique: boolean;
  notNull: boolean;
  increment: boolean;
  default?: string;
  note?: string;
  [key: string]: unknown;
}

export interface DBMLTable {
  name: string;
  schema?: string;
  alias?: string;
  note?: string;
  columns: DBMLColumn[];
}

export interface DBMLRef {
  name?: string;
  endpoints: {
    tableName: string;
    schemaName?: string;
    fieldNames: string[];
    relation: '1' | '*';
  }[];
}

export interface DBMLEnum {
  name: string;
  schema?: string;
  values: { name: string; note?: string }[];
}

export interface ParsedDBML {
  tables: DBMLTable[];
  refs: DBMLRef[];
  enums: DBMLEnum[];
}

export interface ParseResult {
  success: boolean;
  data?: ParsedDBML;
  error?: string;
}

export interface TableNodeData {
  name: string;
  schema?: string;
  columns: DBMLColumn[];
  note?: string;
  [key: string]: unknown;
}

export function parseDBML(dbml: string): ParseResult {
  if (!dbml.trim()) {
    return {
      success: true,
      data: { tables: [], refs: [], enums: [] },
    };
  }

  try {
    const database = new Parser().parse(dbml, 'dbmlv2');

    const tables: DBMLTable[] = database.schemas.flatMap((schema) =>
      schema.tables.map((table) => ({
        name: table.name,
        schema: schema.name !== 'public' ? schema.name : undefined,
        alias: table.alias || undefined,
        note: table.note || undefined,
        columns: table.fields.map((field) => ({
          name: field.name,
          type: field.type.type_name,
          pk: field.pk || false,
          unique: field.unique || false,
          notNull: field.not_null || false,
          increment: field.increment || false,
          default: field.dbdefault?.value,
          note: field.note || undefined,
        })),
      }))
    );

    // Collect refs from all schemas
    const refs: DBMLRef[] = database.schemas.flatMap((schema: any) =>
      (schema.refs || []).map((ref: any) => ({
        name: ref.name || undefined,
        endpoints: ref.endpoints.map((ep: any) => ({
          tableName: ep.tableName,
          schemaName: ep.schemaName !== 'public' ? ep.schemaName : undefined,
          fieldNames: ep.fieldNames,
          relation: ep.relation as '1' | '*',
        })),
      }))
    );

    const enums: DBMLEnum[] = database.schemas.flatMap((schema) =>
      schema.enums.map((e) => ({
        name: e.name,
        schema: schema.name !== 'public' ? schema.name : undefined,
        values: e.values.map((v) => ({
          name: v.name,
          note: v.note || undefined,
        })),
      }))
    );

    return {
      success: true,
      data: { tables, refs, enums },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse DBML',
    };
  }
}

export function sqlToDBML(sql: string, dialect: 'postgres' | 'mysql' | 'mssql' = 'postgres'): ParseResult {
  if (!sql.trim()) {
    return {
      success: true,
      data: { tables: [], refs: [], enums: [] },
    };
  }

  try {
    const dbml = importer.import(sql, dialect);
    return parseDBML(dbml);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse SQL',
    };
  }
}

export function dbmlToSQL(dbml: string, dialect: 'postgres' | 'mysql' | 'mssql' = 'postgres'): string {
  if (!dbml.trim()) {
    return '';
  }

  const database = new Parser().parse(dbml, 'dbmlv2');
  return ModelExporter.export(database, dialect);
}

export function getDBMLString(dbml: string): string {
  const database = new Parser().parse(dbml, 'dbmlv2');
  return ModelExporter.export(database, 'dbml');
}

export function parsedToNodes(parsed: ParsedDBML): Node<TableNodeData>[] {
  return parsed.tables.map((table, index) => ({
    id: table.schema ? `${table.schema}.${table.name}` : table.name,
    type: 'table',
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
    data: {
      name: table.name,
      schema: table.schema,
      columns: table.columns,
      note: table.note,
    },
  }));
}

export function parsedToEdges(parsed: ParsedDBML): Edge[] {
  return parsed.refs.map((ref, index) => {
    const [source, target] = ref.endpoints;
    const sourceId = source.schemaName ? `${source.schemaName}.${source.tableName}` : source.tableName;
    const targetId = target.schemaName ? `${target.schemaName}.${target.tableName}` : target.tableName;

    // Determine relationship type for edge label
    let label = '';
    if (source.relation === '1' && target.relation === '*') {
      label = '1:N';
    } else if (source.relation === '*' && target.relation === '1') {
      label = 'N:1';
    } else if (source.relation === '1' && target.relation === '1') {
      label = '1:1';
    } else if (source.relation === '*' && target.relation === '*') {
      label = 'N:M';
    }

    return {
      id: `${sourceId}-${source.fieldNames.join(',')}-${targetId}-${target.fieldNames.join(',')}`,
      source: sourceId,
      target: targetId,
      sourceHandle: source.fieldNames[0],
      targetHandle: target.fieldNames[0],
      type: 'relation',
      label,
      data: {
        sourceField: source.fieldNames[0],
        targetField: target.fieldNames[0],
        sourceRelation: source.relation,
        targetRelation: target.relation,
      },
    };
  });
}
