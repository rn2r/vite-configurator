import { isPromise } from 'helpers/isPromise';

import type { UserConfigFnPromise, UserConfigExport, ConfigEnv, UserConfig } from 'vite';
import type { AbstractConfigTransformer } from 'types';

export class ConfigTransformer implements AbstractConfigTransformer {
  #handlePromise(config: UserConfig | Promise<UserConfig>) {
    if (isPromise(config)) {
      return config;
    }

    return Promise.resolve(config);
  }

  #handleUserConfig(config: UserConfigExport): UserConfigFnPromise {
    if (typeof config === 'function') {
      return (env: ConfigEnv) => {
        const maybePromise = config(env);
        return this.#handlePromise(maybePromise);
      };
    }

    return () => this.#handlePromise(config);
  }

  transform(config: UserConfigExport): UserConfigFnPromise {
    // we don't need to validate config here, because it
    // will be validated by Vite itself

    return async (env) => {
      const handled = this.#handleUserConfig(config);
      return handled(env);
    };
  }
}
