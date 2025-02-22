import { IR } from '@hey-api/openapi-ts';

import { RemoveReadonly, SchemaObject } from '@/compiler/type';
import { getSchemaNameFromRef } from '@/compiler/utils/naming';

export class DependencyGraph {
  private graph = new Map<string, Set<string>>();
  private schemas = new Map<string, SchemaObject>();

  addSchema(name: string, schema: SchemaObject) {
    this.schemas.set(name, schema);
    this.initializeGraphEntry(name);
    this.addDependencies(name, schema.schema);
  }

  private initializeGraphEntry(name: string) {
    if (!this.graph.has(name)) {
      this.graph.set(name, new Set());
    }
  }

  private addDependencies(schemaName: string, schema: IR.SchemaObject) {
    if (!schema) return;
    this.scanForRefs(schemaName, schema);
  }

  private scanForRefs(schemaName: string, schema: IR.SchemaObject) {
    if (schema.$ref) {
      this.addDependency(schemaName, schema.$ref);
    } else {
      this.scanSchemaProperties(schemaName, schema);
    }
  }

  private addDependency(schemaName: string, ref: string) {
    const dependencyName = getSchemaNameFromRef(ref);
    this.graph.get(schemaName)?.add(dependencyName);
  }

  private scanSchemaProperties(schemaName: string, schema: IR.SchemaObject) {
    if (schema.properties) {
      this.scanProperties(schemaName, schema.properties);
    }
    if (schema.items) {
      this.scanItems(
        schemaName,
        schema.items as RemoveReadonly<IR.SchemaObject> | IR.SchemaObject[]
      );
    }
    if (schema.logicalOperator === 'or' && Array.isArray(schema.items)) {
      this.scanItems(schemaName, schema.items);
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      this.scanForRefs(schemaName, schema.additionalProperties);
    }
  }

  private scanProperties(schemaName: string, properties: Record<string, IR.SchemaObject>) {
    Object.values(properties).forEach((propSchema) => {
      this.scanForRefs(schemaName, propSchema);
    });
  }

  private scanItems(schemaName: string, items: IR.SchemaObject[] | IR.SchemaObject) {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        this.scanForRefs(schemaName, item);
      });
    } else if (items) {
      this.scanForRefs(schemaName, items);
    }
  }

  getSortedSchemas(): SchemaObject[] {
    const visited = new Set<string>();
    const sorted: string[] = [];
    this.schemas.forEach((_, name) => this.visit(name, visited, sorted));
    return sorted.map((name) => this.schemas.get(name)).filter(Boolean) as SchemaObject[];
  }

  private visit(name: string, visited: Set<string>, sorted: string[]) {
    if (visited.has(name)) return;
    visited.add(name);
    this.graph.get(name)?.forEach((dep) => this.visit(dep, visited, sorted));
    sorted.push(name);
  }
}
