class SchemaContextRegistry {
  private currentSchemaStack: string[] = [];

  beginSchema(schemaName: string): void {
    this.currentSchemaStack.push(schemaName);
  }

  endSchema(): void {
    this.currentSchemaStack.pop();
  }

  getCurrentSchemaName(): string | undefined {
    return this.currentSchemaStack.length > 0
      ? this.currentSchemaStack[this.currentSchemaStack.length - 1]
      : undefined;
  }
  isSelfReference(refName: string): boolean {
    return this.getCurrentSchemaName() === refName;
  }
}

export const schemaContext = new SchemaContextRegistry();
