import { BaseConfigurator } from '../configurators/BaseConfigurator';
import { DescriptionTransformer } from '../parts/DescriptionTransformer';
import type {
  AbstractConditionTransformer,
  AbstractConfigTransformer,
  Description,
} from '../types';

type Params = {
  configTransformer: AbstractConfigTransformer;
  conditionTransformer: AbstractConditionTransformer;
  defaultLabel?: string;
};

const validateParams = (params?: Params) => {
  if (!params || Object.keys(params).length === 0) {
    throw new Error('No params passed');
  }

  if (!params.configTransformer) {
    throw new Error('No configTransformer passed');
  }

  if (!params.conditionTransformer) {
    throw new Error('No conditionTransformer passed');
  }
};

export const createBasicHandlers = (params: Params) => {
  validateParams(params);

  const { configTransformer, conditionTransformer, defaultLabel } = params;

  const descriptionTransformer = new DescriptionTransformer(
    configTransformer,
    conditionTransformer,
    defaultLabel
  );

  const configurator = new BaseConfigurator(descriptionTransformer);

  const applyConfig = configurator.handle.bind(configurator);
  const applySingleConfig = (...descriptions: Description[]) =>
    configurator.handle(...descriptions);
  const applyMergedConfig = (...descriptions: Description[]) =>
    configurator.handle(...descriptions, { merge: true });

  return { applyConfig, applySingleConfig, applyMergedConfig };
};
