# vite-configurator

> A simple configurator for vite

## Installation

```bash
todo
```

## Basic Usage

```js
todo;
```

## Table of Contents

todo

## Description

The description is just an abstraction of how a particular configuration gets (or doesn't) into the final vite configuration object. You required to provide description for each configuration you want to apply.

Depending on the api used, the description can take different forms, but in general every description has two required parts:

1. Configuration
2. Condition

```ts
import type { UserConfig } from 'vite';
import type { DescriptionObject, DescriptionTuple } from 'vite-configurator';

const config: UserConfig = { base: 'prod', ... };
const condition = 'build';

const descriptionObject: DescriptionObject = { config, condition }; // description could be an object
const descriptionTuple: DescriptionTuple = [config, condition]; // ...or a tuple
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
2. Promise that resolves general type from p1.
3. Synchronous or asynchronous function that returns general type from p1.

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

### applyNamedConfig

### applyConfig

There is the deepest way to work with the configurator. Now instead of passing a `DescriptionObject` you require to pass a list of `DescriptionTuple`. This is the same as the `DescriptionObject` but with the difference that the `Configuration` and `Condition` are just a part of the tuple. If you want you can provide a label for the description.

```ts
const description: Description = [config, condition];
// or
const description: Description = ['label', config, condition];
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
