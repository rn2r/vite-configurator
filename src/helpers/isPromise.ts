export function isPromise<T = unknown>(value: any): value is Promise<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return typeof value.then === 'function';
}
