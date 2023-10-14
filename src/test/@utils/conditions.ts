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

export const getWrongConditions = (): {
  instantConditions: Condition[];
  runtimeConditions: Condition[];
} => {
  const instantConditions: any[] = [
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
  ];

  const runtimeConditions: any[] = instantConditions.reduce(
    (acc, condition) =>
      acc.concat(
        Promise.resolve(condition),
        () => condition,
        () => Promise.resolve(condition)
      ),
    []
  );

  return { instantConditions, runtimeConditions };
};
