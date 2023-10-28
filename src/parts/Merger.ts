import { isObject } from '../helpers/isObject';
import { isPromise } from '../helpers/isPromise';

import type { UserConfigExport, UserConfigFnPromise, UserConfig } from 'vite';
import type { AbstractMerger, MergeConfig } from '../types';

export class Merger implements AbstractMerger {
  readonly #mergeConfig: MergeConfig;

  constructor(mergeConfig: MergeConfig) {
    this.#mergeConfig = mergeConfig;
  }

  #validateConfigs(configs: any[]): void {
    for (const config of configs) {
      if (typeof config === 'function' || isPromise(config) || isObject(config)) {
        continue;
      }

      throw new Error('Invalid config provided');
    }
  }

  #validateFnResult(result: any): void {
    if (!isObject(result)) {
      throw new Error('Invalid config provided');
    }
  }

  merge(...args: UserConfigExport[] | [...UserConfigExport[], boolean]): UserConfigFnPromise {
    return async (env) => {
      if (args.length === 0) {
        throw new Error('No configs for merge provided');
      }

      if (args.length === 1) {
        const [arg] = args;

        if (typeof arg === 'boolean') {
          throw new Error('No configs for merge provided');
        }

        // eslint-disable-next-line no-console
        console.warn('You provided only one config for merge. This is probably a mistake.');
      }

      const resolvedConfigs: UserConfig[] = [];

      let isRoot = false;
      let configs = args as UserConfigExport[];

      if (typeof args.at(-1) === 'boolean') {
        isRoot = args.at(-1) as boolean;
        configs = args.slice(0, -1) as UserConfigExport[];
      }

      this.#validateConfigs(configs);

      for await (const config of configs) {
        if (typeof config === 'function') {
          const resolvedConfig = await config(env);
          this.#validateFnResult(resolvedConfig);
          resolvedConfigs.push(resolvedConfig);
        } else {
          resolvedConfigs.push(config);
        }
      }

      return resolvedConfigs
        .slice(1)
        .reduce(
          (acc, config) => this.#mergeConfig(acc, config, isRoot),
          resolvedConfigs.at(0) as UserConfig
        );
    };
  }
}
