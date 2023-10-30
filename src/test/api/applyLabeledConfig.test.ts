import { defineConfig } from 'vite';
import { getValidConfigs } from '../@utils/configs';
import { getValidConditions, getAllWrongConditions } from '../@utils/conditions';
import { applyLabeledConfig } from '../../api';

import type { UserConfigExport, UserConfigFn } from 'vite';
import type { Condition, DescriptionObject } from '../../types';

describe('applyLabeledConfig', () => {
  const getDefine = (descriptions: Record<string, DescriptionObject>) => {
    const appliedConfig = applyLabeledConfig(descriptions);
    return defineConfig(appliedConfig) as UserConfigFn;
  };

  it('should apply config', async () => {
    const define = getDefine({ base: { config: { base: 'dir' }, condition: true } });
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'dir' });
  });

  it('should apply first matched config (using inner object keys sorting)', async () => {
    const define = getDefine({
      base: { config: {}, condition: false },
      assetsInclude: { config: { base: 'dir' }, condition: true },
      assetsExclude: { config: {}, condition: true },
    });
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'dir' });
  });

  it('should apply empty config if no one config matched', async () => {
    const define = getDefine({ base: { config: { base: 'dir' }, condition: false } });
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({});
  });

  it('should correct handle all valid ways to get config (true)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine({ base: { config, condition: true } });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({ base: 'dir' });
    };

    await Promise.all(configs.map(checkConfig));
  });

  it('should correct handle all valid ways to get config (false)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine({ base: { config, condition: false } });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({});
    };

    await Promise.all(configs.map(checkConfig));
  });

  it('should correct handle all valid ways to get condition (true)', async () => {
    const conditions = getValidConditions(true, 'build');

    const checkCondition = async (condition: Condition) => {
      const define = getDefine({ base: { config: { base: 'dir' }, condition } });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({ base: 'dir' });
    };

    await Promise.all(conditions.map(checkCondition));
  });

  it('should correct handle all valid ways to get condition (false)', async () => {
    const conditions = getValidConditions(false);

    const checkCondition = async (condition: Condition) => {
      const define = getDefine({ base: { config: { base: 'dir' }, condition } });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({});
    };

    await Promise.all(conditions.map(checkCondition));
  });

  it('should throw error on all wrong ways to get condition', async () => {
    const wrongConditions = getAllWrongConditions();

    const checkRuntimeCondition = async (condition: Condition) => {
      const define = getDefine({ base: { config: { base: 'dir' }, condition } });
      const result = define({ command: 'build', mode: 'production' });

      await expect(result).rejects.toThrow();
    };

    await Promise.all(wrongConditions.map(checkRuntimeCondition));
  });
});
