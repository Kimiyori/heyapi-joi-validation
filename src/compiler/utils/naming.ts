export const getSchemaNameFromRef = (ref: string): string => {
  const parts = ref.split("/");
  return parts[parts.length - 1];
};
export const createSchemaName = (schemaName: string) =>
  `${schemaName.replace('-','')}Validator`;

export const generateValidatorName = (operationId: string, paramType: "Path" | "Query"): string => {
  return `${operationId}${paramType}Validator`;
};