import { ConfigTransformer } from '../../parts/ConfigTransformer';

import type { ConfigEnv, UserConfig, UserConfigExport } from 'vite';

describe('ConfigTransformer', () => {
  const transformer = new ConfigTransformer();

  const testTransform = async (config: UserConfigExport, expected: UserConfig) => {
    const actual = transformer.transform(config);
    expect(actual).toBeInstanceOf(Function);

    const result = actual({ command: 'serve', mode: 'development' });
    expect(result).toBeInstanceOf(Promise);

    const resolved = await result;
    expect(resolved).toEqual(expected);
  };

  it('should transform object config', async () => {
    await testTransform({ plugins: [] }, { plugins: [] });
  });

  it('should transform object promise config', async () => {
    await testTransform(Promise.resolve({ plugins: [] }), { plugins: [] });
  });

  it('should transform function config', async () => {
    await testTransform((env: ConfigEnv) => ({ base: env.command }), { base: 'serve' });
  });

  it('should transform async function config', async () => {
    await testTransform(async (env: ConfigEnv) => ({ base: env.command }), { base: 'serve' });
  });
});
