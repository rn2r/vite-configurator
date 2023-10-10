import { ConditionTransformer } from './ConditionTransformer';

import type { ConfigEnv } from 'vite';
import type { UserCondition } from '../types';

describe('ConditionTransformer', () => {
  const transformer = new ConditionTransformer();
  const passedEnv: ConfigEnv = { mode: 'development', command: 'serve' };

  const testTransform = async (condition: UserCondition, expected: boolean = false) => {
    const transformedCondition = transformer.transform(condition);
    expect(transformedCondition).toBeInstanceOf(Function);

    const handled = transformedCondition(passedEnv);
    expect(handled).toBeInstanceOf(Promise);

    const handledResult = await handled;
    expect(handledResult).toBe(expected);
  };

  it('should transform boolean condition', async () => {
    await testTransform(true, true);
  });

  it('should transform right mode condition', async () => {
    await testTransform('development', true);
  });

  it('should transform wrong mode condition', async () => {
    await testTransform('production', false);
  });

  it('should transform promise boolean condition', async () => {
    await testTransform(Promise.resolve(true), true);
  });

  it('should transform right promise mode condition', async () => {
    await testTransform(Promise.resolve('development'), true);
  });

  it('should transform wrong promise mode condition', async () => {
    await testTransform(Promise.resolve('production'), false);
  });

  it('should transform function right boolean condition', async () => {
    await testTransform((env: ConfigEnv) => env.mode === 'development', true);
  });

  it('should transform function wrong boolean condition', async () => {
    await testTransform((env: ConfigEnv) => env.mode === 'production', false);
  });

  it('should transform function right mode condition', async () => {
    await testTransform((env: ConfigEnv) => env.mode === 'development', true);
  });

  it('should transform function wrong mode condition', async () => {
    await testTransform((env: ConfigEnv) => env.mode === 'production', false);
  });

  it('should transform async function right boolean condition', async () => {
    await testTransform(async (env: ConfigEnv) => env.mode === 'development', true);
  });

  it('should transform async function wrong boolean condition', async () => {
    await testTransform(async (env: ConfigEnv) => env.mode === 'production', false);
  });

  it('should transform async function right mode condition', async () => {
    await testTransform(async (env: ConfigEnv) => env.mode === 'development', true);
  });

  it('should transform async function wrong mode condition', async () => {
    await testTransform(async (env: ConfigEnv) => env.mode === 'production', false);
  });

  describe('should throw on wrong condition', () => {
    const wrongConditions = [
      123,
      123n,
      null,
      undefined,
      {},
      [],
      new Map(),
      new Set(),
      Symbol('test'),
      new Date(),
    ];

    const testInstantError = (condition: any) => {
      expect(() => transformer.transform(condition)).toThrow();
    };

    const testInstantFnError = (condition: any) => {
      const transformedCondition = transformer.transform(condition);
      expect(() => transformedCondition(passedEnv)).toThrow();
    };

    const testPromiseError = async (condition: any) => {
      const transformedCondition = transformer.transform(condition);
      await expect(transformedCondition(passedEnv)).rejects.toThrow();
    };

    it('should throw on wrong "instance" condition', async () => {
      wrongConditions.forEach(testInstantError);
    });

    it('should throw on wrong fn condition', () => {
      wrongConditions.forEach((c) => testInstantFnError(() => c));
    });

    it('should throw on wrong promise condition', async () => {
      await Promise.all(
        wrongConditions.concat(() => {}).map((c) => testPromiseError(Promise.resolve(c)))
      );
    });

    it('should throw on wrong async fn condition', async () => {
      await Promise.all(
        wrongConditions.concat(() => {}).map((c) => testPromiseError(() => Promise.resolve(c)))
      );
    });
  });
});
