import {
  createBasicHandlers,
  createLabeledHandlers,
  createMerge,
  createSimpleHandlers,
} from '../../fabric';

import type {
  AbstractConditionTransformer,
  AbstractConfigTransformer,
  ConfiguratorFabricParams,
  MergeConfig,
} from '../../types';

const conditionTransformer: AbstractConditionTransformer = {
  transform: () => () => Promise.resolve(true),
};

const configTransformer: AbstractConfigTransformer = {
  transform: () => () => Promise.resolve({}),
};

const mergeConfig: MergeConfig = () => ({});

const checkType = (fn: any) => {
  expect(fn).toBeInstanceOf(Function);
};

const checkErrors = (fabric: (params: ConfiguratorFabricParams) => any) => {
  describe('should throw an error if wrong params are passed', () => {
    it('should throw an error if no configTransformer is passed', () => {
      expect(() =>
        fabric({
          conditionTransformer,
          defaultLabel: '',
        } as any)
      ).toThrow();
    });

    it('should throw an error if no conditionTransformer is passed', () => {
      expect(() =>
        fabric({
          configTransformer,
          defaultLabel: '',
        } as any)
      ).toThrow();
    });

    it('should throw an error if empty object passed', () => {
      expect(() => fabric({} as any)).toThrow();
    });

    it('should throw an error if no params passed', () => {
      expect(() => fabric(undefined as any)).toThrow();
    });
  });
};

it('should return an object with functions', () => {
  const { applyMergedConfig, applyConfig } = createBasicHandlers({
    conditionTransformer,
    configTransformer,
    defaultLabel: '',
  });

  expect(applyMergedConfig).toBeInstanceOf(Function);
  expect(applyConfig).toBeInstanceOf(Function);
});

describe('createBasicHandlers', () => {
  it('should return an object with functions', () => {
    const { applyMergedConfig, applyConfig } = createBasicHandlers({
      conditionTransformer,
      configTransformer,
      defaultLabel: '',
    });

    checkType(applyMergedConfig);
    checkType(applyConfig);
  });

  checkErrors(createBasicHandlers);
});

describe('createLabelledHandlers', () => {
  it('should return an object with functions', () => {
    const { applyLabeledConfig } = createLabeledHandlers({
      conditionTransformer,
      configTransformer,
      defaultLabel: '',
    });

    checkType(applyLabeledConfig);
  });

  checkErrors(createLabeledHandlers);
});

describe('createSimpleHandlers', () => {
  it('should return an object with functions', () => {
    const { applySimpleConfig } = createSimpleHandlers({
      conditionTransformer,
      configTransformer,
      defaultLabel: '',
    });

    checkType(applySimpleConfig);
  });

  checkErrors(createSimpleHandlers);
});

describe('createMerge', () => {
  it('should return an object with functions', () => {
    const { merge } = createMerge({
      mergeConfig,
    });

    expect(merge).toBeInstanceOf(Function);
  });

  it('should throw an error if empty object passed', () => {
    expect(() => createMerge({} as any)).toThrow();
  });

  it('should throw an error if no params passed', () => {
    expect(() => createMerge(undefined as any)).toThrow();
  });
});
