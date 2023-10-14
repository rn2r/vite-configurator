import type { DescriptionTuple } from 'types';

export const getWrongDescriptionTuples = (): DescriptionTuple[] => {
  const descriptions: any[] = [
    123,
    123n,
    null,
    undefined,
    Promise.resolve({}),
    {},
    [],
    [1],
    Array.from({ length: 4 + Math.floor(Math.random() * 100) }, () => 1),
    new Map(),
    new Set(),
    Symbol('test'),
    new Date(),
  ];

  return descriptions;
};
