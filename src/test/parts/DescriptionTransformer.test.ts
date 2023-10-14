import { DescriptionTransformer } from 'parts/DescriptionTransformer';
import { getWrongDescriptions } from 'test/@utils/descriptions';

import type { UserConfigFnPromise } from 'vite';
import type { InnerCondition } from 'types';

describe('DescriptionTransformer', () => {
  const defaultLabel = 'unknown';

  const createTransformer = (config: UserConfigFnPromise, condition: InnerCondition) => {
    const configTransformer = { transform: () => config };
    const conditionTransformer = { transform: () => condition };

    return new DescriptionTransformer(configTransformer, conditionTransformer, defaultLabel);
  };

  it('should return correct description', () => {
    const condition = () => Promise.resolve(true);
    const config = () => Promise.resolve({});

    const transformer = createTransformer(config, condition);
    const description = transformer.transform([{}, '']);

    expect(description).toBeInstanceOf(Array);
    expect(description).toHaveLength(2);
    expect(description[0]).toBeInstanceOf(Function);
    expect(typeof description[1] === 'string').toBeTruthy();
  });

  it('function at first argument should return promise', () => {
    const condition = () => Promise.resolve(true);
    const config = () => Promise.resolve({});

    const transformer = createTransformer(config, condition);
    const [checkAndGetConfig] = transformer.transform([{}, '']);

    const result = checkAndGetConfig({ command: 'serve', mode: 'development' });
    expect(result).toBeInstanceOf(Promise);
  });

  it('should return default label if label is not provided', () => {
    const condition = () => Promise.resolve(true);
    const config = () => Promise.resolve({});

    const transformer = createTransformer(config, condition);
    const [, label] = transformer.transform([{}, '']);

    expect(label).toBe(defaultLabel);
  });

  it('should return provided label', () => {
    const condition = () => Promise.resolve(true);
    const config = () => Promise.resolve({});

    const transformer = createTransformer(config, condition);
    const [, label] = transformer.transform(['label', {}, '']);

    expect(label).toBe('label');
  });

  it('promise in function should resolve null if condition did not passed', async () => {
    const condition = () => Promise.resolve(false);
    const config = () => Promise.resolve({});

    const transformer = createTransformer(config, condition);

    const [checkAndGetConfig] = transformer.transform([{}, '']);
    const result = checkAndGetConfig({ command: 'serve', mode: 'development' });
    expect(result).toBeInstanceOf(Promise);

    const resolved = await result;
    expect(resolved).toBeNull();
  });

  it('should return config if condition passed', async () => {
    const userConfig = { plugins: [] };
    const condition = () => Promise.resolve(true);
    const config = () => Promise.resolve(userConfig);

    const transformer = createTransformer(config, condition);

    const [checkAndGetConfig] = transformer.transform([{}, '']);
    const result = checkAndGetConfig({ command: 'serve', mode: 'development' });
    expect(result).toBeInstanceOf(Promise);

    const resolved = await result;
    expect(resolved).toEqual(userConfig);
  });

  it('should throw error then wrong description passed', () => {
    const transformer = createTransformer(
      () => Promise.resolve({}),
      () => Promise.resolve(true)
    );

    const wrongUserDescriptions = getWrongDescriptions();

    wrongUserDescriptions.forEach((description) => {
      expect(() => transformer.transform(description)).toThrow();
    });
  });
});
