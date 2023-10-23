import { defineConfig } from 'vite';
import { applySimpleConfig } from 'api';
import { getValidConfigs } from 'test/@utils/configs';

import type { UserConfigExport, UserConfigFnPromise } from 'vite';
import type { SimpleDescriptions } from 'types';

describe('applySimpleConfig', () => {
  const getDefine = (descriptions: SimpleDescriptions) => {
    const appliedConfig = applySimpleConfig(descriptions);
    return defineConfig(appliedConfig) as UserConfigFnPromise;
  };

  it('should apply dev config', async () => {
    const define = getDefine({
      dev: { base: 'dev' },
      build: { base: 'build' },
      preview: { base: 'preview' },
    });
    const result = await define({ command: 'serve', mode: 'development' });

    expect(result).toEqual({ base: 'dev' });
  });

  it('should apply build config', async () => {
    const define = getDefine({
      dev: { base: 'dev' },
      build: { base: 'build' },
      preview: { base: 'preview' },
    });
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({ base: 'build' });
  });

  it('should apply preview config', async () => {
    const define = getDefine({
      dev: { base: 'dev' },
      build: { base: 'build' },
      preview: { base: 'preview' },
    });
    const result = await define({ command: 'serve', mode: 'production' });

    expect(result).toEqual({ base: 'preview' });
  });

  it('should apply empty config if no one config matched', async () => {
    const define = getDefine({
      dev: { base: 'dev' },
    });
    const result = await define({ command: 'build', mode: 'production' });

    expect(result).toEqual({});
  });

  it('should correct handle all valid ways to get config (true)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine({ build: config });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({ base: 'dir' });
    };

    await Promise.all(configs.map(checkConfig));
  });

  it('should correct handle all valid ways to get config (false)', async () => {
    const configs = getValidConfigs({ base: 'dir' });

    const checkConfig = async (config: UserConfigExport) => {
      const define = getDefine({ dev: config });
      const result = await define({ command: 'build', mode: 'production' });

      expect(result).toEqual({});
    };

    await Promise.all(configs.map(checkConfig));
  });
});
