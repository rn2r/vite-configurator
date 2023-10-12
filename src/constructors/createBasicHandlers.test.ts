import { createBasicHandlers } from './createBasicHandlers';

import type { AbstractConditionTransformer, AbstractConfigTransformer } from '../types';

describe('createBasicHandlers', () => {
  const conditionTransformer: AbstractConditionTransformer = {
    transform: () => () => Promise.resolve(true),
  };
  const configTransformer: AbstractConfigTransformer = {
    transform: () => () => Promise.resolve({}),
  };

  it('should return an object with functions', () => {
    const { applyMergedConfig, applySingleConfig } = createBasicHandlers({
      conditionTransformer,
      configTransformer,
      defaultLabel: '',
    });

    expect(applyMergedConfig).toBeInstanceOf(Function);
    expect(applySingleConfig).toBeInstanceOf(Function);
  });

  describe('should throw an error if wrong params are passed', () => {
    it('should throw an error if no configTransformer is passed', () => {
      expect(() =>
        createBasicHandlers({
          conditionTransformer,
          defaultLabel: '',
        } as any)
      ).toThrow();
    });

    it('should throw an error if no conditionTransformer is passed', () => {
      expect(() =>
        createBasicHandlers({
          configTransformer,
          defaultLabel: '',
        } as any)
      ).toThrow();
    });

    it('should throw an error if empty object passed', () => {
      expect(() => createBasicHandlers({} as any)).toThrow();
    });

    it('should throw an error if no params passed', () => {
      expect(() => createBasicHandlers(undefined as any)).toThrow();
    });
  });
});
