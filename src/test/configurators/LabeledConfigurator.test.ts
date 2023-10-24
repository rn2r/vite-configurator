import { LabeledConfigurator } from 'configurators/LabeledConfigurator';
import { getWrongDescriptionObjects } from 'test/@utils/descriptions';

import type { AbstractBaseConfigurator, DescriptionObject } from 'types';

describe('LabeledConfigurator', () => {
  const handle = jest.fn(() => () => Promise.resolve({}));

  const mockedBaseConfigurator: AbstractBaseConfigurator = {
    handle,
  };

  const configurator = new LabeledConfigurator(mockedBaseConfigurator);

  it('should throw an error if wrong description provided', async () => {
    const wrongDescription = getWrongDescriptionObjects();

    const checkDescription = async (description: Record<string, DescriptionObject>) => {
      const define = configurator.handle(description);
      const result = define({ command: 'build', mode: '' });

      await expect(result).rejects.toThrow();
    };

    await Promise.all(wrongDescription.map(checkDescription));
  });

  it('should throw an error if empty description provided', async () => {
    const define = configurator.handle({});
    const result = define({ command: 'build', mode: '' });

    await expect(result).rejects.toThrow();
  });

  it('should transform description to array of tuples', async () => {
    const description: Record<string, DescriptionObject> = {
      enabled: {
        config: {},
        condition: 'dev',
      },
      disabled: {
        config: {},
        condition: 'dev',
      },
    };

    const define = configurator.handle(description);
    await define({ command: 'build', mode: '' });

    expect(handle).toHaveBeenCalledWith(['enabled', {}, 'dev'], ['disabled', {}, 'dev']);
  });
});
