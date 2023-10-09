import type { UserConfigExport } from 'vite';
import type {
  AbstractConditionTransformer,
  AbstractConfigTransformer,
  AbstractDescriptionTransformer,
  Description,
  InnerDescription,
  UserCondition,
} from '../types';

export class DescriptionTransformer implements AbstractDescriptionTransformer {
  readonly #configTransformer: AbstractConfigTransformer;

  readonly #conditionTransformer: AbstractConditionTransformer;

  readonly #defaultLabel: string;

  constructor(
    configTransformer: AbstractConfigTransformer,
    conditionTransformer: AbstractConditionTransformer,
    defaultLabel = 'unknown'
  ) {
    this.#configTransformer = configTransformer;
    this.#conditionTransformer = conditionTransformer;
    this.#defaultLabel = defaultLabel;
  }

  transform(description: Description): InnerDescription {
    let label = this.#defaultLabel;
    let configuration: UserConfigExport;
    let condition: UserCondition;

    if (description.length === 2) {
      const [passedConfig, passedCondition] = description;
      configuration = passedConfig;
      condition = passedCondition;
    } else {
      const [passedLabel, passedConfig, passedCondition] = description;
      label = passedLabel;
      configuration = passedConfig;
      condition = passedCondition;
    }

    const innerCondition = this.#conditionTransformer.transform(condition);
    const innerConfig = this.#configTransformer.transform(configuration);
    const checkAndGetConfig: InnerDescription[0] = async (env) => {
      const result = await innerCondition(env);

      if (result) {
        const config = await innerConfig(env);
        return config;
      }

      return null;
    };

    return [checkAndGetConfig, label];
  }
}
