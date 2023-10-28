import type { DescriptionObject, DescriptionTuple, SimpleDescriptions } from '../../types';

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
    () => {},
  ];

  return descriptions;
};

export const getWrongDescriptionObjects = (): Record<string, DescriptionObject>[] => {
  const descriptions: any[] = [
    123,
    123n,
    null,
    undefined,
    Promise.resolve({}),
    [],
    new Map(),
    new Set(),
    Symbol('test'),
    new Date(),
    () => {},
  ];

  return descriptions;
};

export const getWrongSimpleDescriptions = (): SimpleDescriptions[] => {
  const baseDescriptions = getWrongDescriptionObjects() as unknown as SimpleDescriptions[];
  return baseDescriptions.concat([
    {
      wrong: {},
    } as unknown as SimpleDescriptions,
  ]);
};
