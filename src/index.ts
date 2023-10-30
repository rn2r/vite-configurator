import type {
  AbstractConfigTransformer,
  AbstractConditionTransformer,
  Condition,
  DescriptionTuple,
  DescriptionObject,
  SimpleDescriptions,
  DefinedRule,
} from './types';

export type {
  AbstractConfigTransformer,
  AbstractConditionTransformer,
  Condition,
  DescriptionTuple,
  DescriptionObject,
  SimpleDescriptions,
  DefinedRule,
};

export {
  applyConfig,
  applyLabeledConfig,
  applyMergedConfig,
  applySimpleConfig,
  merge,
} from './api';

export {
  createBasicHandlers,
  createLabeledHandlers,
  createSimpleHandlers,
  createMerge,
} from './fabric';
