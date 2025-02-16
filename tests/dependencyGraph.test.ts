import { SchemaObject } from '@/compiler/type';
import { DependencyGraph } from '@/compiler/utils/dependencyGraph';

const createMockSchema = (name: string, dependencies: string[] = []): SchemaObject => ({
  $ref: `#/components/schemas/${name}`,
  name,
  schema: {
    type: 'object',
    properties: dependencies.reduce(
      (acc, dep) => ({
        ...acc,
        [dep]: { $ref: `#/components/schemas/${dep}` },
      }),
      {}
    ),
  },
});

describe('DependencyGraph', () => {
  let graph: DependencyGraph;

  beforeEach(() => {
    graph = new DependencyGraph();
  });

  test('simple linear dependency', () => {
    const schemas = [
      createMockSchema('A', ['B']),
      createMockSchema('B', ['C']),
      createMockSchema('C'),
    ];

    schemas.forEach((schema) => graph.addSchema(schema.name, schema));
    const sorted = graph.getSortedSchemas();

    expect(sorted.map((s) => s.name)).toEqual(['C', 'B', 'A']);
  });

  test('complex dependencies with cycles', () => {
    const schemas = [
      createMockSchema('A', ['B', 'C']),
      createMockSchema('B', ['C']),
      createMockSchema('C', ['D']),
      createMockSchema('D'),
    ];

    schemas.forEach((schema) => graph.addSchema(schema.name, schema));
    const sorted = graph.getSortedSchemas();

    expect(sorted.map((s) => s.name)).toEqual(['D', 'C', 'B', 'A']);
  });

  test('handles array and logical operator dependencies', () => {
    const arraySchema: SchemaObject = {
      $ref: '#/components/schemas/ArraySchema',
      name: 'ArraySchema',
      schema: {
        type: 'array',
        items: [{ $ref: '#/components/schemas/Item1' }, { $ref: '#/components/schemas/Item2' }],
      },
    };

    const logicalSchema: SchemaObject = {
      $ref: '#/components/schemas/LogicalSchema',
      name: 'LogicalSchema',
      schema: {
        logicalOperator: 'or',
        items: [{ $ref: '#/components/schemas/Option1' }, { $ref: '#/components/schemas/Option2' }],
      },
    };

    const dependencies = [
      createMockSchema('Item1'),
      createMockSchema('Item2'),
      createMockSchema('Option1'),
      createMockSchema('Option2'),
      arraySchema,
      logicalSchema,
    ];

    dependencies.forEach((schema) => graph.addSchema(schema.name, schema));
    const sorted = graph.getSortedSchemas();

    expect(sorted.length).toBe(6);
    expect(sorted.findIndex((s) => s.name === 'ArraySchema')).toBeGreaterThan(
      sorted.findIndex((s) => s.name === 'Item1')
    );
    expect(sorted.findIndex((s) => s.name === 'LogicalSchema')).toBeGreaterThan(
      sorted.findIndex((s) => s.name === 'Option1')
    );
  });
});
