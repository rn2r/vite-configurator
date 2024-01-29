import { isPromise } from '../helpers/isPromise';
import { getConditionValidator } from '../helpers/getConditionValidator';

import type { ConfigEnv } from 'vite';
import type {
  AbstractConditionTransformer,
  InnerCondition,
  Condition,
  DefinedRule,
} from '../types';

export class ConditionTransformer implements AbstractConditionTransformer {
  #validator: ReturnType<typeof getConditionValidator>;

  constructor() {
    this.#validator = getConditionValidator();
  }

  #handlePrimitiveCondition(condition: boolean | DefinedRule, env: ConfigEnv) {
    const { command, mode } = env;

    if (condition === 'dev') {
      return command === 'serve' && mode === 'development';
    }

    if (condition === 'build') {
      return command === 'build' && mode === 'production';
    }

    if (condition === 'preview') {
      return command === 'serve' && mode === 'production';
    }

    if (condition === 'test') {
      return command === 'serve' && mode === 'test';
    }

    return condition;
  }

  async #handlePromiseCondition(condition: Promise<boolean | DefinedRule>, env: ConfigEnv) {
    const conditionResult = await condition;
    this.#validator.validatePromiseResult(conditionResult);

    return this.#handlePrimitiveCondition(conditionResult, env);
  }

  async #handleFnCondition(
    condition: (env: ConfigEnv) => boolean | DefinedRule | Promise<boolean | DefinedRule>,
    env: ConfigEnv
  ) {
    const maybePromise = condition(env);
    this.#validator.validateFunctionResult(maybePromise);

    if (isPromise(maybePromise)) {
      return this.#handlePromiseCondition(maybePromise, env);
    }

    return this.#handlePrimitiveCondition(maybePromise, env);
  }

  transform(condition: Condition): InnerCondition {
    return async (env) => {
      this.#validator.validateCondition(condition);

      if (isPromise(condition)) {
        return this.#handlePromiseCondition(condition, env);
      }

      if (typeof condition === 'function') {
        return this.#handleFnCondition(condition, env);
      }

      return this.#handlePrimitiveCondition(condition, env);
    };
  }
}
