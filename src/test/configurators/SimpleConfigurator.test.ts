import { getWrongSimpleDescriptions } from '../@utils/descriptions';
import { SimpleConfigurator } from '../../configurators/SimpleConfigurator';

import type { AbstractBaseConfigurator, SimpleDescriptions } from '../../types';

describe('LabeledConfigurator', () => {
  const handle = jest.fn(() => () => Promise.resolve({}));

  const mockedBaseConfigurator: AbstractBaseConfigurator = {
    handle,
  };

  const configurator = new SimpleConfigurator(mockedBaseConfigurator);

  it('should throw an error if wrong description provided', async () => {
    const wrongDescription = getWrongSimpleDescriptions();

    const checkDescription = async (description: SimpleDescriptions) => {
      const define = configurator.handle(description);
      const result = define({ command: 'build', mode: '' });

      await expect(result).rejects.toThrow();
    };

    await Promise.all(wrongDescription.map(checkDescription));
  });

  it('should throw an error if empty description provided', async () => {
    const define = configurator.handle({} as SimpleDescriptions);
    const result = define({ command: 'build', mode: '' });

    await expect(result).rejects.toThrow();
  });

  it('should transform description to array of tuples', async () => {
    const description: SimpleDescriptions = {
      dev: {
        base: 'dev',
      },
      build: {
        base: 'build',
      },
      preview: {
        base: 'preview',
      },
      test: {
        base: 'test',
      },
    };

    const define = configurator.handle(description);
    await define({ command: 'build', mode: '' });

    expect(handle).toHaveBeenCalledWith(
      ['dev', { base: 'dev' }, 'dev'],
      ['build', { base: 'build' }, 'build'],
      ['preview', { base: 'preview' }, 'preview'],
      ['test', { base: 'test' }, 'test']
    );
  });
});
