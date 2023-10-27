import { isPromise } from './isPromise';

export const isObject = <T extends unknown = unknown>(value: any): value is Record<string, T> => {
  if (!value) return false;
  if (typeof value !== 'object') return false;
  if (isPromise(value)) return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Date) return false;
  if (value instanceof RegExp) return false;
  if (value instanceof Set) return false;
  if (value instanceof Map) return false;
  if (value instanceof WeakSet) return false;
  if (value instanceof WeakMap) return false;
  if (value instanceof Error) return false;

  return true;
};
