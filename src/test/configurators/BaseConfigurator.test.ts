import { mergeConfig } from 'vite';
import { BaseConfigurator } from '../../configurators/BaseConfigurator';

import type { UserConfig } from 'vite';
import type { AbstractDescriptionTransformer, Condition } from '../../types';

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
    const result = configurator.handle([enabled, {}, 'dev']);

    expect(result).toBeInstanceOf(Function);
    expect(result({ command: 'build', mode: '' })).toBeInstanceOf(Promise);
  });

  it('should resolve empty config if no one config matched', async () => {
    const result = configurator.handle([disabled, {}, 'dev'], [disabled, {}, 'dev']);

    await expect(result({ command: 'build', mode: '' })).resolves.toEqual({});
  });

  it('should resolve empty config if no one config matched with merge option', async () => {
    const result = configurator.handle([disabled, {}, 'dev'], [disabled, {}, 'dev'], {
      merge: true,
    });

    await expect(result({ command: 'build', mode: '' })).resolves.toEqual({});
  });

  it('should return the config if only one description is passed', async () => {
    const config = {};
    const result = configurator.handle([enabled, config, 'dev']);

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should return the config if only one description is passed with merge option', async () => {
    const config = {};
    const result = configurator.handle([enabled, config, 'dev'], { merge: true });

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should choose first passed config without merge option', async () => {
    const config = {};
    const result = configurator.handle([disabled, {}, 'dev'], [enabled, config, 'dev']);

    await expect(result({ command: 'build', mode: '' })).resolves.toBe(config);
  });

  it('should merge passed configs with merge option', async () => {
    const config1: UserConfig = { base: 'src', plugins: [false] };
    const config2: UserConfig = { plugins: [null] };
    const merged = mergeConfig(config1, config2);

    const result = configurator.handle(
      [enabled, config1, 'dev'],
      [disabled, { base: 'dir' }, 'dev'],
      [enabled, config2, 'dev'],
      {
        merge: true,
      }
    );

    await expect(result({ command: 'build', mode: '' })).resolves.toStrictEqual(merged);
  });
});
