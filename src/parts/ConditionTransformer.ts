import { isPromise } from 'helpers/isPromise';

import type { ConfigEnv } from 'vite';
import type { AbstractConditionTransformer, InnerCondition, Condition, DefinedRule } from 'types';

export class ConditionTransformer implements AbstractConditionTransformer {
  #validate(condition: any, params: { allowed: string[]; mayBePromise?: boolean }): void {
    const { allowed, mayBePromise } = params;

    if (allowed.includes(typeof condition) || (mayBePromise && isPromise(condition))) {
      if (typeof condition !== 'string') {
        return;
      }

      if (['dev', 'build', 'preview'].includes(condition)) {
        return;
      }
    }

    allowed.splice(allowed.indexOf('string'), 1, 'dev', 'build', 'preview');

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

  async #handlePromiseCondition(condition: Promise<boolean | DefinedRule>, env: ConfigEnv) {
    const conditionResult = await condition;
    this.#validatePromiseResult(conditionResult);

    return this.#handlePrimitiveCondition(conditionResult, env);
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

    return condition;
  }

  #handleCondition(condition: Condition): InnerCondition {
    if (isPromise(condition)) {
      return (env) => this.#handlePromiseCondition(condition, env);
    }

    if (typeof condition === 'function') {
      return (env) =>
        new Promise((resolve, reject) => {
          try {
            const maybePromise = condition(env);
            this.#validateFunctionResult(maybePromise);

            if (isPromise(maybePromise)) {
              this.#handlePromiseCondition(maybePromise, env).then(resolve).catch(reject);
            } else {
              const result = this.#handlePrimitiveCondition(maybePromise, env);
              resolve(result);
            }
          } catch (error) {
            reject(error);
          }
        });
    }

    return (env) => {
      const result = this.#handlePrimitiveCondition(condition, env);
      return Promise.resolve(result);
    };
  }

  transform(condition: Condition): InnerCondition {
    this.#validateCondition(condition);

    return (env) => {
      const handled = this.#handleCondition(condition);
      return handled(env);
    };
  }
}
