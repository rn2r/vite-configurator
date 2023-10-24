import { defineConfig, mergeConfig } from 'vite';
import { applyMergedConfig } from 'api';
import { mockedPlugin } from 'test/@utils/plugins';
import { getValidConfigs } from 'test/@utils/configs';
import { getValidConditions, getAllWrongConditions } from 'test/@utils/conditions';

import type { UserConfig, UserConfigExport, UserConfigFnPromise } from 'vite';
import type { Condition, DescriptionTuple } from 'types';

describe('applyMergedConfig', () => {
  const getDefine = (...descriptions: DescriptionTuple[]) => {
    const appliedConfig = applyMergedConfig(...descriptions);
    return defineConfig(appliedConfig) as UserConfigFnPromise;
  };

  it('should apply single config', async () => {
    const define = getDefine([{ base: 'dir' }, true]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'dir' });
  });

  it('should merge matched configs', async () => {
    const config1: UserConfig = { base: 'dir', plugins: [mockedPlugin()] };
    const config2: UserConfig = { assetsInclude: 'dir' };
    const expectedConfig = mergeConfig(config1, config2);

    const define = getDefine([config1, true], [config2, true]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual(expectedConfig);
  });

  it('should apply empty config if no one config matched', async () => {
    const define = getDefine([{ base: 'dir' }, false]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({});
  });

  it('should correct handle all valid ways to get config (true)', async () => {
    const config1 = { base: 'dir' };
    const config2 = { assetsInclude: 'dir', plugins: [mockedPlugin()] };

    const configs1 = getValidConfigs(config1);
    const configs2 = getValidConfigs(config2);
    const expectedConfig = mergeConfig(config1, config2);

    const zippedConfigs = configs1.map((c1) => configs2.map((c2) => [c1, c2])).flat();

    const checkConfigs = async (configs: UserConfigExport[]) => {
      const configsToDefine = configs.map((config) => [config, true]) as DescriptionTuple[];
      const define = getDefine(...configsToDefine);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual(expectedConfig);
    };

    await Promise.all(zippedConfigs.map(checkConfigs));
  });

  it('should correct handle all valid ways to get config (false)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine([config, false]);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({});
    };

    await Promise.all(configs.map(checkConfig));
  });

  it('should correct handle all valid ways to get condition (true)', async () => {
    const conditions = getValidConditions(true, 'build');

    const checkCondition = async (condition: Condition) => {
      const config1: UserConfig = { base: 'dir', plugins: [mockedPlugin()] };
      const config2: UserConfig = { assetsInclude: 'dir' };
      const expectedConfig = mergeConfig(config1, config2);

      const define = getDefine([config1, condition], [config2, condition]);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual(expectedConfig);
    };

    await Promise.all(conditions.map(checkCondition));
  });

  it('should correct handle all valid ways to get condition (false)', async () => {
    const conditions = getValidConditions(false);

    const checkCondition = async (condition: Condition) => {
      const define = getDefine([{ base: 'dir' }, condition]);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({});
    };

    await Promise.all(conditions.map(checkCondition));
  });

  it('should throw error on all wrong ways to get condition', async () => {
    const wrongConditions = getAllWrongConditions();

    const checkRuntimeCondition = async (condition: Condition) => {
      const define = getDefine([{ base: 'dir' }, condition]);
      const result = define({ command: 'build', mode: 'production' });

      await expect(result).rejects.toThrow();
    };

    await Promise.all(wrongConditions.map(checkRuntimeCondition));
  });
});
