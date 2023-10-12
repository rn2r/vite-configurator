import type { UserConfig, UserConfigExport } from 'vite';

export const getValidConfigs = (result: UserConfig): UserConfigExport[] => [
  result,
  Promise.resolve(result),
  () => result,
  () => Promise.resolve(result),
];
