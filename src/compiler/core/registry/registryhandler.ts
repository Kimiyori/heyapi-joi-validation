import { IR } from '@hey-api/openapi-ts';

import {
  RefSchemaHandler,
  LogicalAndSchemaHandler,
  LogicalOrSchemaHandler,
  StringSchemaHandler,
  NumberSchemaHandler,
  BooleanSchemaHandler,
  EnumSchemaHandler,
  ArraySchemaHandler,
  ObjectSchemaHandler,
  TupleSchemaHandler,
  NullSchemaHandler,
  UndefinedSchemaHandler,
} from '@/compiler/handlers';
import { SchemaHandler } from '@/compiler/handlers/base';

export enum HandlerType {
  REFERENCE = 'reference',
  LOGICAL = 'logical',
  TYPE = 'type',
}

export class HandlerRegistry {
  private static instance: HandlerRegistry;
  private handlers: Map<HandlerType, SchemaHandler[]>;

  private constructor() {
    this.handlers = new Map();
    this.handlers.set(HandlerType.REFERENCE, []);
    this.handlers.set(HandlerType.LOGICAL, []);
    this.handlers.set(HandlerType.TYPE, []);
  }

  public static getInstance(): HandlerRegistry {
    if (!HandlerRegistry.instance) {
      HandlerRegistry.instance = new HandlerRegistry();
    }
    return HandlerRegistry.instance;
  }

  public register(type: HandlerType, handler: SchemaHandler, position?: number): void {
    const handlers = this.handlers.get(type) || [];

    if (position !== undefined && position >= 0 && position <= handlers.length) {
      handlers.splice(position, 0, handler);
    } else {
      handlers.push(handler);
    }

    this.handlers.set(type, handlers);
  }

  public getHandlers(type: HandlerType): SchemaHandler[] {
    return [...(this.handlers.get(type) || [])];
  }

  public findHandler(type: HandlerType, schema: IR.SchemaObject): SchemaHandler | undefined {
    const handlers = this.getHandlers(type);
    return handlers.find((handler) => handler.canHandle(schema));
  }
}

export function registerBuiltInHandlers(
  registry: HandlerRegistry = HandlerRegistry.getInstance()
): void {
  // Register reference handlers
  registry.register(HandlerType.REFERENCE, new RefSchemaHandler());

  // Register logical handlers
  registry.register(HandlerType.LOGICAL, new LogicalAndSchemaHandler());
  registry.register(HandlerType.LOGICAL, new LogicalOrSchemaHandler());

  // Register type handlers
  registry.register(HandlerType.TYPE, new StringSchemaHandler());
  registry.register(HandlerType.TYPE, new NumberSchemaHandler());
  registry.register(HandlerType.TYPE, new BooleanSchemaHandler());
  registry.register(HandlerType.TYPE, new EnumSchemaHandler());
  registry.register(HandlerType.TYPE, new ArraySchemaHandler());
  registry.register(HandlerType.TYPE, new ObjectSchemaHandler());
  registry.register(HandlerType.TYPE, new TupleSchemaHandler());
  registry.register(HandlerType.TYPE, new NullSchemaHandler());
  registry.register(HandlerType.TYPE, new UndefinedSchemaHandler());
}
