import { merge } from 'api';
import { getWrongConfigs } from 'test/@utils/configs';
import { UserConfig, UserConfigExport, mergeConfig } from 'vite';

describe('merge', () => {
  const config1: UserConfig = { base: 'dir' };
  const config2: UserConfig = { plugins: [] };
  const expectedConfig = mergeConfig(config1, config2);

  it('should merge object configs', async () => {
    const merged = merge(config1, config2);
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge promise configs', async () => {
    const merged = merge(Promise.resolve(config1), Promise.resolve(config2));
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge synchronous fn configs', async () => {
    const merged = merge(
      () => config1,
      () => config2
    );
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge asynchronous fn configs', async () => {
    const merged = merge(
      () => Promise.resolve(config1),
      () => Promise.resolve(config2)
    );
    const config = await merged({ command: 'serve', mode: 'development' });

    expect(config).toEqual(expectedConfig);
  });

  it('should merge mixed configs', async () => {
    const config3: UserConfig = { build: { ssrEmitAssets: true } };
    const config4: UserConfig = { build: { ssr: true } };

    const merged = merge(
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
    const merged = merge(...([] as unknown as [UserConfigExport]));
    await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
  });

  it('should throw an error if only "isRoot" option provided', async () => {
    const merged = merge(true as any);
    await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
  });

  it('should throw an error if wrong config provided', async () => {
    const wrongConfigs = getWrongConfigs();

    const checkConfig = async (config: UserConfigExport) => {
      const merged = merge({ base: 'dir' }, config, { define: {} });
      await expect(merged({ command: 'serve', mode: 'development' })).rejects.toThrow();
    };

    await Promise.all(wrongConfigs.map(checkConfig));
  });
});
