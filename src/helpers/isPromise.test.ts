import { isPromise } from './isPromise';

describe('isPromise', () => {
  it('should return true for a Promise', () => {
    expect(isPromise(new Promise(() => {}))).toBe(true);
  });

  it('should return false for a non-Promise value', () => {
    expect(isPromise('not a Promise')).toBe(false);
    expect(isPromise(123)).toBe(false);
    expect(isPromise({})).toBe(false);
    expect(isPromise([])).toBe(false);
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
    expect(isPromise(() => {})).toBe(false);
  });
});
