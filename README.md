# Hey API - Joi Validator Generator Plugin

A plugin for [@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) that automatically generates [Joi](https://joi.dev/) validators from OpenAPI schemas.

## Installation

```bash
npm install heyapi-joi-validation
# or
yarn add heyapi-joi-validation
```

## Usage

```typescript
import { defineConfig } from '@hey-api/openapi-ts';
import { JoiValidatorPlugin } from 'heyapi-joi-validation';
export default {
  client: '@hey-api/client-fetch',
  input: <your-url>,
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './test-generate/',
    case: 'camelCase',
  },
  plugins: [JoiValidatorPlugin()],
};
```

## Features

- 🚀 Automatic Joi validator generation from OpenAPI schemas
- ✨ Support for path, query, and body parameter validation
- 🔄 Handles complex types including nested objects and arrays
- 📝 TypeScript support with full type definitions
- 🔍 Runtime validation using Joi's powerful schema system

## Example

Given this OpenAPI schema:

```json
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          }
        },
        "required": ["name", "email"]
      }
    }
  }
}
```

The plugin will generate:

```typescript
import Joi from 'joi';

export const UserValidator = Joi.object({
  id: Joi.number().integer(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).label('UserValidator');
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
