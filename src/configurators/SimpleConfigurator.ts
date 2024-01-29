import { ExtendedConfigurator } from './ExtendedConfigurator';
import { isObject } from '../helpers/isObject';

import type { AbstractBaseConfigurator, DefinedRule, SimpleDescriptions } from '../types';

export class SimpleConfigurator extends ExtendedConfigurator<[SimpleDescriptions]> {
  protected validate(descriptions: SimpleDescriptions): void {
    if (!isObject(descriptions)) {
      throw new Error('Invalid description provided');
    }

    const validKeys = new Set<DefinedRule>(['dev', 'test', 'build', 'preview']);
    for (const key in descriptions) {
      if (!validKeys.has(key as DefinedRule)) {
        throw new Error(`Invalid description provided: ${key}`);
      }
    }

    if (Object.keys(descriptions).length === 0) {
      throw new Error('Empty description provided');
    }
  }

  protected transform<P = Parameters<AbstractBaseConfigurator['handle']>>(
    descriptions: SimpleDescriptions
  ): P {
    return Object.entries(descriptions).map(([label, config]) => [label, config, label]) as P;
  }
}
