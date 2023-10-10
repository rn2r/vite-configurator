import { ConfigTransformer } from './parts/ConfigTransformer';
import { ConditionTransformer } from './parts/ConditionTransformer';
import { createBasicHandlers } from './constructors/createBasicHandlers';

const configTransformer = new ConfigTransformer();
const conditionTransformer = new ConditionTransformer();

const { applyConfig, applySingleConfig, applyMergedConfig } = createBasicHandlers({
  conditionTransformer,
  configTransformer,
});

export { applyConfig, applySingleConfig, applyMergedConfig };
