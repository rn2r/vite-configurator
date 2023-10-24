import type { Condition, DefinedRule } from 'types';

interface GetValidConditions {
  (result: false): Condition[];
  (result: true, mode: DefinedRule): Condition[];
}

export const getValidConditions: GetValidConditions = (
  result: boolean,
  mode: DefinedRule = 'dev'
) => [
  result,
  Promise.resolve(result),
  () => result,
  () => Promise.resolve(result),
  mode,
  Promise.resolve(mode),
  () => mode,
  () => Promise.resolve(mode),
];

export const getBasicWrongConditions = (): Condition[] =>
  [
    '',
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
  ] as any[];

export const getAllWrongConditions = (): Condition[] =>
  getBasicWrongConditions().reduce(
    (acc, condition) =>
      acc.concat([
        condition,
        Promise.resolve(condition),
        () => condition,
        () => Promise.resolve(condition),
      ] as any[]),
    [] as Condition[]
  );
