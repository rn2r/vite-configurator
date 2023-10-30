<div align="center">
<h1>
vite-configurator
<br>
</h1>

<p>Manage vite configurations with ease</p>

</div>

## Installation

```bash
npm install vite-configurator
```

## Basic Usage

```js
import { defineConfig } from 'vite';
import { applySimpleConfig, merge } from 'vite-configurator';
import { defaultConfig, prodConfig, devConfig } from './configs';

const config = merge(defaultConfig, applySimpleConfig({ dev: devConfig, build: prodConfig }));

export default defineConfig(config);
```

## Table of Contents

- [Motivation](#motivation)
- [Important Notice](#important-notice)
- [Description](#description)
  - [Configuration](#configuration)
  - [Condition](#condition)
- [API](#api)

  - [applySimpleConfig](#applysimpleconfig)
  - [applyLabeledConfig](#applylabeledconfig)
  - [applyConfig](#applyconfig)
  - [applyMergedConfig](#applymergedconfig)

## Motivation

`Vite` offers us to [manage configurations](https://vitejs.dev/config/#conditional-config) using the if statement in the some "root" configuration.

```ts
import { defineConfig, mergeConfig } from 'vite';
import { baseConfig, devConfig, prodConfig } from './configs';

export default defineConfig(({ command, mode, ssrBuild }) => {
  if (command === 'serve') {
    return mergeConfig(baseConfig, devConfig);
  } else {
    return mergeConfig(baseConfig, prodConfig);
  }
});
```

This approach has several problematic points:

1. You write rules for the configurations applying in the configuration itself. It's provided unnecessary responsibility to the configuration logic and makes the configuration less readable.
2. It's not easy to merge configurations. For example, if you want to have a default configuration and then apply some additional configuration for the development build, and then for the test build, you will have to write a lot of if statements.
3. It's not easy to combine different configurations types. Vite config can be an object, a function that returns an object or a promise that resolves to an object. If you want to use different types of configurations for different build, you will have to manually transform them to the same type.

`Vite-configurator` solves these problems by providing a simple api for managing configurations. It's just wrap all of your configurations into the function that is executed at vite startup. This function will get the vite environment and will return the configuration that should be applied, depending on provided rules.

```js
import { defineConfig } from 'vite';
import { applySimpleConfig, merge } from 'vite-configurator';
import { baseConfig, devConfig, prodConfig } from './configs';

const config = merge(baseConfig, applySimpleConfig({ dev: devConfig, build: prodConfig }));

export default defineConfig(config);
```

`Vite-configurator` provides a simple but powerful api for merging configurations and creating your own conditional configurations.

## Important Notice

In further documentation, the following pattern will be used:

```ts
const define = defineConfig(config);
define({ command: 'serve', mode: 'development' }); // for dev build example
define({ command: 'build', mode: 'production' }); // for prod build example
define({ command: 'serve', mode: 'production' }); // for preview build example
```

You should not use the `define` function. It's just for demonstration purposes. You should just default export the config result of `defineConfig(config)` function:

```ts
export default defineConfig(config);
```

## Description

The description is just an abstraction of how a particular configuration gets (or doesn't) into the final vite configuration object. You required to provide description for each configuration you want to apply.

Depending on the api used, the description can take different forms, but in general every description has two required parts:

1. Configuration
2. Condition

```ts
import type { UserConfig } from 'vite';
import type { DescriptionObject, DescriptionTuple, SimpleDescriptions } from 'vite-configurator';

const config: UserConfig = { base: 'prod', ... };
const condition = 'build';

const descriptionObject: DescriptionObject = { config, condition }; // description could be an object
const descriptionTuple: DescriptionTuple = [config, condition]; // ...or a tuple
const simpleDescription: SimpleDescriptions = { dev: config, build: config }; // ...or just a simplified object, that holds conditions as keys
```

The logic is simple - if the condition is met, the configuration will be selected for use.

### Configuration

The configuration is just a `UserConfigExport` from vite. It can be:

```ts
import type { UserConfigExport, ConfigEnv } from 'vite';

const config: UserConfigExport = { base: 'prod', ... }; // an object
const config: UserConfigExport = Promise.resolve({ base: 'prod', ... }); // a promise that resolves to an object
const config: UserConfigExport = (env: ConfigEnv) => ({ base: 'prod', ... }); // a function that returns an object
const config: UserConfigExport = (env: ConfigEnv) => Promise.resolve({ base: 'prod', ... }); // a function that returns a promise that resolves to an object
```

If you decide to use functions, you can use the `ConfigEnv` to get information about the current environment. You can check the [vite docs](https://vitejs.dev/config/#configuring-vite) for more information.

> **Note**: vite-configurator doesn't check correctness of the configuration. It's passed directly to vite, where it will be checked.

### Condition

The condition is a rule that will be checked before the configuration is applied. It can be:

1. In general boolean or string (`"build"`/`"dev"`/`"preview"`);
2. Promise that resolves to boolean or string (`"build"`/`"dev"`/`"preview"`);
3. Synchronous or asynchronous function that returns boolean or string (`"build"`/`"dev"`/`"preview"`);

> **Note**: vite-configurator strictly checks the type of the condition. If it's not one of the above types, it will throw an error. You should not depend on javascript's type conversion.

#### boolean

This type of condition will always be met or not met.

```ts
const condition = true;
const condition = false;
```

#### string (`"build"`/`"dev"`/`"preview"`)

This type of condition will be met if the vite's environment command and mode are passed some of the rules.

```ts
const condition = 'build'; // command: 'build', mode: 'production'
const condition = 'dev'; // command: 'serve', mode: 'development'
const condition = 'preview'; // command: 'serve', mode: 'production'
```

#### promise

If you need to get the condition asynchronously, you can use a promise. The resolved condition should be one of the above types.

```ts
const condition = Promise.resolve(true); // or false
const condition = Promise.resolve('build'); // or 'dev' or 'preview'
```

#### synchronous or asynchronous function

If you need to get the condition in runtime, using vite environment or some other logic, you can use a function. The returned condition should be one of the above types.

```ts
import type { ConfigEnv } from 'vite';

const condition = (env: ConfigEnv) => env.mode === 'production';

const condition = async (env: ConfigEnv) => {
  const data = await fetch(`.../canApply?mode=${env.mode}`);
  const canApply = await data.json();
  return canApply;
};
```

## API

### applySimpleConfig

`(descriptions: SimpleDescriptions): UserConfigFn`

There is the simplest way to work with the configurator. You just need to pass a `SimpleDescriptions` and it will apply the config if the condition (as object keys) is met. If no description matches the condition it will apply the empty config. In this case, the condition can be only one of predefined rules:

1. `"build"` - passes if vite command is `{ command: 'build', mode: 'production' }`
2. `"dev"` - passes if vite command is `{ command: 'serve', mode: 'development' }`
3. `"preview"` - passes if vite command is `{ command: 'serve', mode: 'production' }`

```ts
import { defineConfig } from 'vite';
import { applySimpleConfig } from 'vite-configurator';

const define = defineConfig(
  applySimpleConfig({
    dev: { base: 'dev' },
    build: () => ({ base: 'prod' }),
    preview: ({ command }) => Promise.resolve({ base: command }), // command will be 'serve' in this case
  })
);

define({ command: 'serve', mode: 'development' }); // config resolves to { base: 'dev' }
define({ command: 'build', mode: 'production' }); // config resolves to { base: 'prod' }
define({ command: 'serve', mode: 'production' }); // config resolves to { base: 'serve' }
```

### applyLabeledConfig

`(descriptions: Record<string, DescriptionObject>): UserConfigFn`

If you want to provide your own conditions for configurations, you can use this function. It's the same as the `applySimpleConfig` but instead of predefined conditions for description, you required to provide your own `Description Object`.

First config that matches the condition will be applied. If no description matches the condition it will apply the empty config.

```ts
import { defineConfig } from 'vite';
import { applyLabeledConfig } from 'vite-configurator';

const firstConfig: DescriptionObject = {
  config: { base: 'first' },
  condition: ({ command }) => command === 'serve',
};

const testsConfig: DescriptionObject = {
  config: { base: 'tests' },
  condition: ({ mode }) => mode === 'test',
};

const define = defineConfig(applySimpleConfig({ firstConfig, testsConfig }));

define({ command: 'serve', mode: 'development' }); // config resolves to { base: 'first' }
define({ command: 'build', mode: 'production' }); // config resolves to {}
define({ command: 'serve', mode: 'test' }); // config resolves to { base: 'tests' }
```

#### Important notice

Depending on the objects mapping rules, you can't be sure that passed descriptions will be checked in the order you provided them.
So, if you have descriptions with conditions that can be met at the same time and want to be sure that the order of the descriptions is preserved, you should use `applyConfig` or `applyMergedConfig` functions

### applyConfig

`(...descriptions: DescriptionTuple[]): UserConfigFn`

There is the deepest way to work with the configurator. Now instead of passing a `DescriptionObject` you require to pass a list of `DescriptionTuple`. This is the same as the `DescriptionObject` but with the difference that the `Configuration` and `Condition` are just a part of the tuple. If you want you can provide a label for the description.

```ts
const description: DescriptionTuple = [config, condition];
// or
const description: DescriptionTuple = ['label', config, condition];
```

applyConfig will apply the first and only the first description that matches it's condition. If no description matches the condition it will apply the empty config.

```ts
import { defineConfig } from 'vite';
import { applyConfig } from 'vite-configurator';

const config = applyConfig(
  [{ base: 'prod' }, 'production'],
  [{ base: 'dev' }, () => 'development'],
  [{ cacheDir: 'custom-cache' }, Promise.resolve(true)]
);

const define = defineConfig(config);
define({ command: 'serve', mode: 'development' }); // config resolves to { base: 'dev' }
define({ command: 'build', mode: 'production' }); // config resolves to { base: 'prod' }
```

```ts
import { defineConfig } from 'vite';
import { applyConfig } from 'vite-configurator';

const config = applyConfig([{ base: 'prod' }, false]);

const define = defineConfig(config);
define({ command: 'serve', mode: 'development' }); // config resolves to {}
```

### applyMergedConfig

`(...descriptions: DescriptionTuple[]): UserConfigFn`

Usage of this function is the same as the `applyConfig` but the difference is that it will apply all descriptions that match their condition. The order of the descriptions is important. The last description will merged into the previous ones. The merging is done with vite `mergeConfig` function.

```ts
import { defineConfig } from 'vite';
import { applyMergedConfig } from 'vite-configurator';

const config = applyMergedConfig(
  [{ base: 'prod' }, 'production'],
  [{ base: 'dev' }, () => 'development'],
  [{ cacheDir: 'custom-cache' }, Promise.resolve(true)]
);

const define = defineConfig(config);
define({ command: 'serve', mode: 'development' }); // config resolves to { base: 'dev', cacheDir: 'custom-cache' }
define({ command: 'build', mode: 'production' }); // config resolves to { base: 'prod', cacheDir: 'custom-cache' }
```

### merge

`(...configs: UserConfigExport, isRoot?: boolean): UserConfigFn`

This function is used to merge the configs. Differences from `mergeConfig` from the `vite`:

1. It can merge functions, objects and promises, not only objects.
2. It return asynchronous function that returns promise that resolves to the merged config.
3. It can merge several configs one by one.

```ts
import { defineConfig } from 'vite';
import { merge } from 'vite-configurator';

const defaultConfig = { base: 'default' };
const additionalConfig = () => Promise.resolve({ build: { ssr: true } });

const mergedConfig = merge(defaultConfig, additionalConfig);

const define = defineConfig(mergedConfig);
define({ command: 'serve', mode: 'development' }); // config resolves to { base: 'default', build: { ssr: true } }
```
