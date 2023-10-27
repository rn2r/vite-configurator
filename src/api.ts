import { mergeConfig } from 'vite';
import {
  createBasicHandlers,
  createLabeledHandlers,
  createMerge,
  createSimpleHandlers,
} from 'fabric';
import { ConfigTransformer } from 'parts/ConfigTransformer';
import { ConditionTransformer } from 'parts/ConditionTransformer';

const configTransformer = new ConfigTransformer();
const conditionTransformer = new ConditionTransformer();

const { applyConfig, applyMergedConfig } = createBasicHandlers({
  conditionTransformer,
  configTransformer,
});

const { applyLabeledConfig } = createLabeledHandlers({
  conditionTransformer,
  configTransformer,
});

const { applySimpleConfig } = createSimpleHandlers({
  conditionTransformer,
  configTransformer,
});

const { merge } = createMerge({
  mergeConfig,
});

export { applyConfig, applyMergedConfig, applyLabeledConfig, applySimpleConfig, merge };
