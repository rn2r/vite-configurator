import { UserConfigFn } from 'vite';

import type { AbstractBaseConfigurator } from '../types';

export abstract class ExtendedConfigurator<A extends any[]> {
  #configurator: AbstractBaseConfigurator;

  protected abstract transform<P = Parameters<AbstractBaseConfigurator['handle']>>(
    ...args: A
  ): P | Promise<P>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected validate(...args: A): void | Promise<void> {}

  constructor(configurator: AbstractBaseConfigurator) {
    this.#configurator = configurator;
  }

  handle(...args: A): UserConfigFn {
    return async (env) => {
      await this.validate(...args);

      const descriptions = await this.transform(...args);
      const handler = this.#configurator.handle(...descriptions);

      return handler(env);
    };
  }
}
