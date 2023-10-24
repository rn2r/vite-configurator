import { mergeConfig } from 'vite';
import { Merger } from 'parts/Merger';
import { getWrongConfigs } from 'test/@utils/configs';

import type { UserConfig, UserConfigExport } from 'vite';

describe('Merger', () => {
  const mockedMergeConfig = jest.fn(mergeConfig);
  const merger = new Merger(mockedMergeConfig);
  const config1: UserConfig = { base: 'dir' };
  const config2: UserConfig = { plugins: [] };
  const expectedConfig = mergeConfig(config1, config2);

  it('should merge object configs', async () => {
    const merged = merger.merge(config1, config2);
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge promise configs', async () => {
    const merged = merger.merge(Promise.resolve(config1), Promise.resolve(config2));
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge synchronous fn configs', async () => {
    const merged = merger.merge(
      () => config1,
      () => config2
    );
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge asynchronous fn configs', async () => {
    const merged = merger.merge(
      () => Promise.resolve(config1),
      () => Promise.resolve(config2)
    );
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge mixed configs', async () => {
    const config3: UserConfig = { build: { ssrEmitAssets: true } };
    const config4: UserConfig = { build: { ssr: true } };

    const merged = merger.merge(
      config1,
      Promise.resolve(config2),
      () => config3,
      () => Promise.resolve(config4)
    );
    const config = await merged({ command: 'serve', mode: 'development' });

    const part1 = mergeConfig(config1, config2);
    const part2 = mergeConfig(part1, config3);
    const expectedMixedConfig = mergeConfig(part2, config4);

    expect(config).toEqual(expectedMixedConfig);
  });

  it('should throw an error if no configs provided', async () => {
    const merged = merger.merge(...([] as unknown as [UserConfigExport]));
    await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
  });

  it('should throw an error if only "isRoot" option provided', async () => {
    const merged = merger.merge(true as any);
    await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
  });

  it('should throw an error if wrong config provided', async () => {
    const wrongConfigs = getWrongConfigs();

    const checkConfig = async (config: UserConfigExport) => {
      const merged = merger.merge({ base: 'dir' }, config, { define: {} });
      await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
    };

    await Promise.all(wrongConfigs.map(checkConfig));
  });

  it('should provide "isRoot" option as false by default', async () => {
    const merged = merger.merge({ base: 'dir' }, { plugins: [] });
    await merged({ command: 'serve', mode: 'development' });

    expect(mockedMergeConfig.mock.lastCall?.at(-1)).toEqual(false);
  });

  it('should provide passed "isRoot" option to mergeConfigFn', async () => {
    const merged = merger.merge({ base: 'dir' }, { plugins: [] }, true);
    await merged({ command: 'serve', mode: 'development' });

    expect(mockedMergeConfig.mock.lastCall?.at(-1)).toEqual(true);
  });
});
