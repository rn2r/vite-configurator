import { BaseConfigurator } from 'configurators/BaseConfigurator';
import { LabeledConfigurator } from 'configurators/LabeledConfigurator';
import { SimpleConfigurator } from 'configurators/SimpleConfigurator';
import { DescriptionTransformer } from 'parts/DescriptionTransformer';
import { Merger } from 'parts/Merger';

import type {
  ConfiguratorFabricParams,
  DescriptionObject,
  DescriptionTuple,
  MergerFabricParams,
  SimpleDescriptions,
} from 'types';

const validateConfiguratorParams = (params?: ConfiguratorFabricParams) => {
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

const getBaseConfigurator = (params: ConfiguratorFabricParams) => {
  const { configTransformer, conditionTransformer, defaultLabel } = params;

  const descriptionTransformer = new DescriptionTransformer(
    configTransformer,
    conditionTransformer,
    defaultLabel
  );

  return new BaseConfigurator(descriptionTransformer);
};

export const createBasicHandlers = (params: ConfiguratorFabricParams) => {
  validateConfiguratorParams(params);

  const configurator = getBaseConfigurator(params);

  const applyConfig = (...descriptions: DescriptionTuple[]) =>
    configurator.handle(...descriptions, { merge: false });
  const applyMergedConfig = (...descriptions: DescriptionTuple[]) =>
    configurator.handle(...descriptions, { merge: true });

  return { applyConfig, applyMergedConfig };
};

export const createLabeledHandlers = (params: ConfiguratorFabricParams) => {
  validateConfiguratorParams(params);

  const baseConfigurator = getBaseConfigurator(params);
  const configurator = new LabeledConfigurator(baseConfigurator);

  const applyLabeledConfig = (descriptions: Record<string, DescriptionObject>) =>
    configurator.handle(descriptions);

  return { applyLabeledConfig };
};

export const createSimpleHandlers = (params: ConfiguratorFabricParams) => {
  validateConfiguratorParams(params);

  const baseConfigurator = getBaseConfigurator(params);
  const configurator = new SimpleConfigurator(baseConfigurator);

  const applySimpleConfig = (descriptions: SimpleDescriptions) => configurator.handle(descriptions);

  return { applySimpleConfig };
};

const validateMergerParams = (params?: MergerFabricParams) => {
  if (!params || Object.keys(params).length === 0) {
    throw new Error('No params passed');
  }

  if (!params.mergeConfig) {
    throw new Error('No mergeConfig passed');
  }
};

export const createMerge = (params: MergerFabricParams) => {
  validateMergerParams(params);

  const { mergeConfig } = params;
  const merger = new Merger(mergeConfig);

  const merge: typeof merger.merge = (...args) => merger.merge(...args);

  return { merge };
};
