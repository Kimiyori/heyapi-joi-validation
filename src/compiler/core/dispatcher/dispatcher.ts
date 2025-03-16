import { IR } from '@hey-api/openapi-ts';
import { Expression } from 'typescript';

import { chainMethods } from '@/compiler/ast/factory';

import { HandlerRegistry, HandlerType, registerBuiltInHandlers } from '../registry/registryhandler';

export class SchemaHandlerDispatcher {
  private registry: HandlerRegistry;

  constructor(registry?: HandlerRegistry) {
    this.registry = registry || HandlerRegistry.getInstance();
  }
  dispatch(schema: IR.SchemaObject): Expression {
    const referenceHandler = this.registry.findHandler(HandlerType.REFERENCE, schema);
    if (referenceHandler) {
      return referenceHandler.execute(schema);
    }

    const logicalHandler = this.registry.findHandler(HandlerType.LOGICAL, schema);
    if (logicalHandler) {
      return logicalHandler.execute(schema);
    }

    const typeHandler = this.registry.findHandler(HandlerType.TYPE, schema);
    if (typeHandler) {
      return typeHandler.execute(schema);
    }

    return chainMethods('joi', 'any');
  }
}

const registry = HandlerRegistry.getInstance();
registerBuiltInHandlers(registry);

export const dispatcher = new SchemaHandlerDispatcher(registry);
