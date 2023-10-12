import { mergeConfig } from 'vite';

import type { UserConfig, UserConfigFnPromise } from 'vite';
import type {
  AbstractBaseConfigurator,
  AbstractDescriptionTransformer,
  Description,
  InnerDescription,
} from '../types';

export class BaseConfigurator implements AbstractBaseConfigurator {
  #descriptionTransformer: AbstractDescriptionTransformer;

  constructor(descriptionTransformer: AbstractDescriptionTransformer) {
    this.#descriptionTransformer = descriptionTransformer;
  }

  #validateArgs(args: Parameters<AbstractBaseConfigurator['handle']>): void {
    const withoutArgs = args.length === 0;
    const onlyOptionsPassed = args.length === 1 && !Array.isArray(args[0]);

    if (withoutArgs || onlyOptionsPassed) {
      throw new Error('No description passed to configurator');
    }
  }

  #getDescriptionsAndMergeOptions(
    args: Parameters<AbstractBaseConfigurator['handle']>
  ): [InnerDescription[], boolean] {
    let descriptions: Description[];
    let merge = false;

    const lastArg = args.at(-1);

    if (!Array.isArray(lastArg)) {
      descriptions = args.slice(0, -1) as Description[];
      const options = lastArg as { merge: boolean };
      merge = options.merge;
    } else {
      descriptions = args as Description[];
    }

    const innerDescriptions = descriptions.map((d) => this.#descriptionTransformer.transform(d));

    return [innerDescriptions, merge];
  }

  #mergeConfigs(descriptions: InnerDescription[]): UserConfigFnPromise {
    return async (env) => {
      const configs: UserConfig[] = [];
      let idx = 0;

      const lookForConfig = () =>
        new Promise<void>((resolve, reject) => {
          const description = descriptions[idx];

          if (description) {
            const [tryConfig] = description;

            tryConfig(env)
              .then((config) => {
                if (config) {
                  configs.push(config);
                }
                idx += 1;
                lookForConfig().then(resolve).catch(reject);
              })
              .catch(reject);
          } else {
            resolve();
          }
        });

      await lookForConfig();

      if (configs.length === 0) {
        return {};
      }

      if (configs.length === 1) {
        return configs[0];
      }

      return configs.slice(1).reduce((acc, config) => mergeConfig(acc, config), configs[0]);
    };
  }

  #selectOneConfig(descriptions: InnerDescription[]): UserConfigFnPromise {
    return (env) => {
      let idx = 0;

      const lookForConfig = () =>
        new Promise<UserConfig>((resolve, reject) => {
          const description = descriptions[idx];

          if (description) {
            const [tryConfig] = description;

            tryConfig(env)
              .then((config) => {
                if (config) {
                  resolve(config);
                } else {
                  idx += 1;
                  lookForConfig().then(resolve).catch(reject);
                }
              })
              .catch(reject);
          } else {
            resolve({});
          }
        });

      return lookForConfig();
    };
  }

  handle(...args: Parameters<AbstractBaseConfigurator['handle']>): UserConfigFnPromise {
    this.#validateArgs(args);

    const [descriptions, merge] = this.#getDescriptionsAndMergeOptions(args);

    if (merge) {
      return this.#mergeConfigs(descriptions);
    }

    return this.#selectOneConfig(descriptions);
  }
}
