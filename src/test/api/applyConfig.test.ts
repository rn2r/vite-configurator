import { defineConfig } from 'vite';
import { getValidConfigs } from '../@utils/configs';
import { getValidConditions, getWrongConditions } from '../@utils/conditions';
import { applyConfig } from '../../api';

import type { UserConfigExport, UserConfigFnPromise } from 'vite';
import type { Condition, Description } from '../../types';

describe('applyConfig', () => {
  const getDefine = (...descriptions: Description[]) => {
    const appliedConfig = applyConfig(...descriptions);
    return defineConfig(appliedConfig) as UserConfigFnPromise;
  };

  it('should apply config', async () => {
    const define = getDefine([{ base: 'dir' }, true]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'dir' });
  });

  it('should apply first matched config', async () => {
    const define = getDefine([{}, false], [{ base: 'dir' }, true], [{}, true]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'dir' });
  });

  it('should apply empty config if no one config matched', async () => {
    const define = getDefine([{ base: 'dir' }, false]);
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({});
  });

  it('should correct handle all valid ways to get config (true)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine([config, true]);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({ base: 'dir' });
    };

    await Promise.all(configs.map(checkConfig));
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
    const conditions = getValidConditions(true, 'production');

    const checkCondition = async (condition: Condition) => {
      const define = getDefine([{ base: 'dir' }, condition]);
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({ base: 'dir' });
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
    const { instantConditions, runtimeConditions } = getWrongConditions();

    instantConditions.forEach((condition) => {
      expect(() => applyConfig([{ base: 'dir' }, condition])).toThrow();
    });

    const checkRuntimeCondition = async (condition: Condition) => {
      const define = getDefine([{ base: 'dir' }, condition]);
      const result = define({ command: 'build', mode: 'production' });

      await expect(result).rejects.toThrow();
    };

    await Promise.all(runtimeConditions.map(checkRuntimeCondition));
  });
});
