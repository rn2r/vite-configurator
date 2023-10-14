import { PluginOption } from 'vite';

export const mockedPlugin = (): PluginOption => ({
  name: 'mocked-plugin',
  resolveId: () => 'mocked-plugin',
  load: () => 'mocked-plugin',
  config: () => ({}),
});
