import { ConditionTransformer } from '../../parts/ConditionTransformer';
import { getWrongConditions } from 'test/@utils/conditions';

import type { ConfigEnv } from 'vite';
import type { Condition } from '../../types';

describe('ConditionTransformer', () => {
  const transformer = new ConditionTransformer();
  const passedEnv: ConfigEnv = { mode: 'development', command: 'serve' };

  const testTransform = async (condition: Condition, expected: boolean = false) => {
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

  it('should throw error on all wrong ways to get condition', async () => {
    const { instantConditions, runtimeConditions } = getWrongConditions();

    instantConditions.forEach((condition) => {
      expect(() => transformer.transform(condition)).toThrow();
    });

    const checkRuntimeCondition = async (condition: Condition) => {
      const transformedCondition = transformer.transform(condition);
      const result = transformedCondition(passedEnv);

      await expect(result).rejects.toThrow();
    };

    await Promise.all(runtimeConditions.map(checkRuntimeCondition));
  });
});
