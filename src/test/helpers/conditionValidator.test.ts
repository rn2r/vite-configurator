import { getBasicWrongConditions } from '../@utils/conditions';
import { getConditionValidator } from '../../helpers/getConditionValidator';

describe('getConditionValidator', () => {
  const validator = getConditionValidator();
  const wrongConditions = getBasicWrongConditions();

  it('should return object with helpers', () => {
    expect(validator.validateCondition).toBeInstanceOf(Function);
    expect(validator.validateFunctionResult).toBeInstanceOf(Function);
    expect(validator.validatePromiseResult).toBeInstanceOf(Function);
  });

  it('"validateCondition" should validate wrong condition', () => {
    wrongConditions.forEach((condition) => {
      expect(() => validator.validateCondition(condition)).toThrow();
    });
  });

  it('"validateFunctionResult" should validate wrong function result', () => {
    wrongConditions.forEach((condition) => {
      expect(() => validator.validateFunctionResult(() => condition)).toThrow();
      expect(() => validator.validateFunctionResult(() => Promise.resolve(condition))).toThrow();
    });
  });

  it('"validatePromiseResult" should validate wrong promise result', () => {
    wrongConditions.forEach((condition) => {
      expect(() => validator.validatePromiseResult(Promise.resolve(condition))).toThrow();
    });
  });
});
