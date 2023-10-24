import type { UserConfig, UserConfigExport } from 'vite';

export const getValidConfigs = (result: UserConfig): UserConfigExport[] => [
  result,
  Promise.resolve(result),
  () => result,
  () => Promise.resolve(result),
];

export const getWrongConfigs = (): UserConfigExport[] => {
  const configs: any[] = [
    1,
    10n,
    'string',
    [],
    true,
    null,
    undefined,
    Symbol(''),
    () => 1,
    () => 'string',
    () => true,
    () => null,
    () => undefined,
    () => Symbol(''),
    () => () => 10,
  ];

  return configs;
};
