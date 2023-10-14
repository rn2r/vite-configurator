import type { UserConfigExport, ConfigEnv, UserConfigFnPromise, UserConfig } from 'vite';

type EnvFn<T> = (env: ConfigEnv) => T;

type ObjectCondition<T> = T | Promise<T>;
type FnCondition<T> = EnvFn<ObjectCondition<T>> | EnvFn<T> | EnvFn<Promise<T>>;
type ObjectOrFnCondition<T> = ObjectCondition<T> | FnCondition<T>;

/**
 * An expression whose result is determined by a boolean value
 */
type BooleanCondition = ObjectOrFnCondition<boolean>;

/**
 * An expression whose result is determined by a string equal to the current mode
 */
type ModeCondition = ObjectOrFnCondition<string>;

/**
 * Condition passed by user
 */
export type Condition = BooleanCondition | ModeCondition;

/**
 * Description tuple passed by user
 */
export type DescriptionTuple =
  | [string, UserConfigExport, Condition]
  | [UserConfigExport, Condition];

/**
 * Every condition is transformed to async function that returns boolean
 */
export type InnerCondition = EnvFn<Promise<boolean>>;
/**
 * Every inner description combined user's config and condition
 * to a single async function that returns user's config or null,
 * depending on the condition result
 */
export type InnerDescription = [EnvFn<Promise<UserConfig | null>>, string];

export interface AbstractConditionTransformer {
  transform(condition: Condition): InnerCondition;
}

export interface AbstractConfigTransformer {
  transform(config: UserConfigExport): UserConfigFnPromise;
}

export interface AbstractDescriptionTransformer {
  transform(description: DescriptionTuple): InnerDescription;
}

export interface AbstractBaseConfigurator {
  handle(
    ...args: DescriptionTuple[] | [...DescriptionTuple[], { merge: boolean }]
  ): UserConfigFnPromise;
}
