import { isObject } from '../../helpers/isObject';

describe('isObject', () => {
  it('should return true for object', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('should return false for non-object', () => {
    const nonObjects = [
      null,
      undefined,
      1,
      'string',
      true,
      false,
      () => {},
      10n,
      Symbol(''),
      new Set(),
      new Map(),
      new WeakSet(),
      new WeakMap(),
      new Date(),
      /(?:)/,
    ];

    nonObjects.forEach((value) => {
      expect(isObject(value)).toBe(false);
    });
  });
});
