import { isPromise } from '../helpers/isPromise';

import type { ConfigEnv } from 'vite';
import type { AbstractConditionTransformer, InnerCondition, UserCondition } from '../types';

export class ConditionTransformer implements AbstractConditionTransformer {
  #validate(condition: any, params: { allowed: string[]; mayBePromise?: boolean }): void {
    const { allowed, mayBePromise } = params;

    if (allowed.includes(typeof condition) || (mayBePromise && isPromise(condition))) {
      return;
    }

    if (mayBePromise) {
      allowed.push('promise');
    }

    throw new Error(
      `Condition must be one of ${allowed.join(', ')}, got ${typeof condition} instead`
    );
  }

  #validateCondition(condition: any): void {
    this.#validate(condition, { allowed: ['boolean', 'string', 'function'], mayBePromise: true });
  }

  #validateFunctionResult(result: any): void {
    this.#validate(result, { allowed: ['boolean', 'string'], mayBePromise: true });
  }

  #validatePromiseResult(result: any): void {
    this.#validate(result, { allowed: ['boolean', 'string'] });
  }

  async #handlePromiseCondition(condition: Promise<boolean | string>, env: ConfigEnv) {
    const conditionResult = await condition;
    this.#validatePromiseResult(conditionResult);

    return this.#handlePrimitiveCondition(conditionResult, env);
  }

  #handlePrimitiveCondition(condition: boolean | string, env: ConfigEnv) {
    return typeof condition === 'boolean' ? condition : env.mode === condition;
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
        this.#validateFunctionResult(maybePromise);

        if (isPromise(maybePromise)) {
          return this.#handlePromiseCondition(maybePromise, env);
        }

        const result = this.#handlePrimitiveCondition(maybePromise, env);
        return Promise.resolve(result);
      };
    }

    return (env) => this.#handlePromiseCondition(condition, env);
  }

  transform(condition: UserCondition): InnerCondition {
    this.#validateCondition(condition);

    return (env) => {
      const handled = this.#handleCondition(condition);
      return handled(env);
    };
  }
}
