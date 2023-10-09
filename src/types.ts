import type { UserConfigExport, ConfigEnv, UserConfigFnPromise, UserConfig } from 'vite';

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

export interface AbstractDescriptionTransformer {
  transform(description: Description): InnerDescription;
}

export interface AbstractBaseConfigurator {
  handle(...args: Description[] | [...Description[], { merge: boolean }]): UserConfigFnPromise;
}

type DescriptionWithLabel = [string, UserConfigExport, UserCondition];
type DescriptionWithoutLabel = [UserConfigExport, UserCondition];

/**
 * Config that can be passed
 */
export type Description = DescriptionWithLabel | DescriptionWithoutLabel;
export type InnerDescription = [EnvFn<Promise<UserConfig | null>>, string];
