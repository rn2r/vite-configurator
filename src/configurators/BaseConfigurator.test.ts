import { mergeConfig } from 'vite';
import { BaseConfigurator } from './BaseConfigurator';

import type { UserConfig } from 'vite';
import type { AbstractDescriptionTransformer, Condition } from '../types';

describe('BaseConfigurator', () => {
  const enabled = 'enabled';
  const disabled = 'disabled';

  const mockDescriptionTransformer: AbstractDescriptionTransformer = {
    transform: ([label, config]: [string, UserConfig, Condition]) => [
      () => Promise.resolve(label === enabled ? config : null),
      label,
    ],
  };

  const configurator = new BaseConfigurator(mockDescriptionTransformer);

  it('should throw an error if no description is passed', () => {
    expect(() => configurator.handle()).toThrow();
  });

  it('should throw an error if only options passed', () => {
    expect(() => configurator.handle({ merge: true })).toThrow();
  });

  it('should return a function that return a promise', () => {
    const result = configurator.handle([enabled, {}, '']);

    expect(result).toBeInstanceOf(Function);
    expect(result({ command: 'build', mode: '' })).toBeInstanceOf(Promise);
  });

  it('should throw if no config is returned', async () => {
    const result = configurator.handle([disabled, {}, ''], [disabled, {}, '']);

    await expect(result({ command: 'build', mode: '' })).rejects.toThrow();
  });

  it('should throw if no config is returned with merge option', async () => {
    const result = configurator.handle([disabled, {}, ''], [disabled, {}, ''], { merge: true });

    await expect(result({ command: 'build', mode: '' })).rejects.toThrow();
  });

  it('should return the config if only one description is passed', async () => {
    const config = {};
    const result = configurator.handle([enabled, config, '']);

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should return the config if only one description is passed with merge option', async () => {
    const config = {};
    const result = configurator.handle([enabled, config, ''], { merge: true });

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should choose first passed config without merge option', async () => {
    const config = {};
    const result = configurator.handle([disabled, {}, ''], [enabled, config, '']);

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should merge passed configs with merge option', async () => {
    const config1: UserConfig = { base: 'src', plugins: [false] };
    const config2: UserConfig = { plugins: [null] };
    const merged = mergeConfig(config1, config2);

    const result = configurator.handle(
      [enabled, config1, ''],
      [disabled, { base: 'dir' }, ''],
      [enabled, config2, ''],
      {
        merge: true,
      }
    );

    await expect(result({ command: 'build', mode: '' })).resolves.toStrictEqual(merged);
  });
});
