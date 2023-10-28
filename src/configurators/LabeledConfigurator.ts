import { ExtendedConfigurator } from './ExtendedConfigurator';
import { isObject } from '../helpers/isObject';

import type { AbstractBaseConfigurator, DescriptionObject } from '../types';

export class LabeledConfigurator extends ExtendedConfigurator<[Record<string, DescriptionObject>]> {
  protected validate(descriptions: Record<string, DescriptionObject>): void {
    if (!isObject(descriptions)) {
      throw new Error('Invalid description provided');
    }

    if (Object.keys(descriptions).length === 0) {
      throw new Error('Empty description provided');
    }
  }

  protected transform<P = Parameters<AbstractBaseConfigurator['handle']>>(
    descriptions: Record<string, DescriptionObject>
  ): P {
    return Object.entries(descriptions).map(([label, { config, condition }]) => [
      label,
      config,
      condition,
    ]) as P;
  }
}
