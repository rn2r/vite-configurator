import type { UserConfigExport, ConfigEnv, UserConfigFnPromise } from 'vite';

type EnvFn<T> = (env: ConfigEnv) => T;

export type ObjectCondition<T> = T | Promise<T>;
export type FnCondition<T> = EnvFn<ObjectCondition<T>> | EnvFn<T> | EnvFn<Promise<T>>;

export type Condition<T> = ObjectCondition<T> | FnCondition<T>;
export type BooleanCondition = Condition<boolean>;
export type ModeCondition = Condition<string>;
export type UserCondition = BooleanCondition | ModeCondition;
export type InnerCondition = EnvFn<Promise<boolean>>;

export interface AbstractConditionTransformer {
  transform(condition: UserCondition): InnerCondition;
}

export interface AbstractConfigTransformer {
  transform(config: UserConfigExport): UserConfigFnPromise;
}

/**
 * Config that can be passed
 */
export type Config =
  | UserConfigExport // { ... }
  | [UserConfigExport] // [{ ... }]
  | [UserConfigExport, ConfigEnv['mode']] // [{ ... }, 'build']
  | [UserConfigExport, boolean] // @example [{ ... }, true]
  | [UserConfigExport, (env: ConfigEnv) => boolean] // [{ ... }, ({ command }) => command === 'build']
  | [UserConfigExport, (env: ConfigEnv) => Promise<boolean>]; // [{ ... }, async ({ command }) => command === 'build']
