import { isPromise } from './isPromise';

type ValidateParams = {
  allowed: string[];
  mayBePromise: boolean;
};

export const getConditionValidator = () => {
  const isValid = (condition: any, params: ValidateParams) => {
    const { allowed, mayBePromise } = params;

    const isValidMode = typeof condition === 'string' && allowed.includes(condition);
    const isValidType = allowed.includes(typeof condition);
    const isValidPromise = mayBePromise && isPromise(condition);

    return isValidMode || isValidType || isValidPromise;
  };

  const enumerateConditions = (params: ValidateParams) => {
    const { allowed, mayBePromise } = params;

    return allowed.concat(mayBePromise ? ['promise'] : []).join(', ');
  };

  const validate = (condition: any, params: ValidateParams) => {
    if (isValid(condition, params)) {
      return;
    }

    const allowedConditions = enumerateConditions(params);

    throw new Error(
      `Condition must be one of ${allowedConditions}, got ${typeof condition} instead`
    );
  };

  return {
    validateCondition(condition: any): void {
      validate(condition, {
        allowed: ['boolean', 'dev', 'build', 'preview', 'test', 'function'],
        mayBePromise: true,
      });
    },

    validateFunctionResult(result: any): void {
      validate(result, {
        allowed: ['boolean', 'dev', 'build', 'preview', 'test'],
        mayBePromise: true,
      });
    },

    validatePromiseResult(result: any): void {
      validate(result, {
        allowed: ['boolean', 'dev', 'build', 'preview', 'test'],
        mayBePromise: false,
      });
    },
  };
};
