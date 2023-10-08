import { defineConfig } from 'vite';
import { ConfigTransformer } from '../parts/ConfigTransformer';

import type { UserConfigFn } from 'vite';

describe('base configs', () => {
  const transformer = new ConfigTransformer();
  it('should transform object config', async () => {
    const config = {
      plugins: [],
    };
    const expected = {
      plugins: [],
    };

    const actual = defineConfig(transformer.transform(config)) as UserConfigFn;
    expect(actual).toBeInstanceOf(Function);

    const result = actual({ command: 'serve', mode: 'development' });
    expect(result).toBeInstanceOf(Promise);

    const resolved = await result;
    expect(resolved).toEqual(expected);
  });
});
