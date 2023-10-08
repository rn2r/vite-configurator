import { isPromise } from '../helpers/isPromise';

import type { ConfigEnv } from 'vite';
import type { AbstractConditionTransformer, InnerCondition, UserCondition } from '../types';

export class ConditionTransformer implements AbstractConditionTransformer {
  #getConditionType(condition: UserCondition) {
    if (typeof condition === 'boolean' || typeof condition === 'string') {
      return 'boolean';
    }

    if (typeof condition === 'function') {
      return 'function';
    }

    if (isPromise(condition)) {
      return 'promise';
    }

    return 'unknown';
  }

  async #handlePromiseCondition(condition: Promise<boolean | string>, env: ConfigEnv) {
    const conditionResult = await condition;
    return this.#handlePrimitiveCondition(conditionResult, env);
  }

  #handleBooleanCondition(condition: boolean) {
    return condition;
  }

  #handleModeCondition(condition: string, env: ConfigEnv) {
    return env.mode === condition;
  }

  #handlePrimitiveCondition(condition: boolean | string, env: ConfigEnv) {
    if (typeof condition === 'boolean') {
      return this.#handleBooleanCondition(condition);
    }

    return this.#handleModeCondition(condition, env);
  }

  #handleCondition(condition: UserCondition): InnerCondition {
    if (typeof condition === 'boolean' || typeof condition === 'string') {
      return (env) => {
        const result = this.#handlePrimitiveCondition(condition, env);
        return Promise.resolve(result);
      };
    }

    if (typeof condition === 'function') {
      return (env) => {
        const maybePromise = condition(env);

        if (isPromise(maybePromise)) {
          return this.#handlePromiseCondition(maybePromise, env);
        }

        return this.#handlePromiseCondition(Promise.resolve(maybePromise), env);
      };
    }

    if (isPromise(condition)) {
      return (env) => {
        const result = this.#handlePromiseCondition(condition, env);
        return result;
      };
    }

    throw new Error(`Unknown condition type: ${this.#getConditionType(condition)}`);
  }

  transform(condition: UserCondition): InnerCondition {
    return (env) => {
      const handled = this.#handleCondition(condition);
      return handled(env);
    };
  }
}
