import type { Plugin } from '@hey-api/openapi-ts';

import { handler } from '@/plugin';
import type { Config } from '@/types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  myOption: false, // implements default value from types
  name: 'joi',
  output: 'joi',
};

/**
 * Type helper for `my-plugin` plugin, returns {@link Plugin.Config} object
 */
export const joiValidatorPlugin: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
