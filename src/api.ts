import { createBasicHandlers, createLabeledHandlers } from 'fabric';
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

export { applyConfig, applyMergedConfig, applyLabeledConfig };
