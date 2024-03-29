import type { UserConfigExport, ConfigEnv, UserConfigFn, UserConfig } from 'vite';

type EnvFn<T> = (env: ConfigEnv) => T;

type ObjectCondition<T> = T | Promise<T>;
type FnCondition<T> = EnvFn<ObjectCondition<T>> | EnvFn<T> | EnvFn<Promise<T>>;
type ObjectOrFnCondition<T> = ObjectCondition<T> | FnCondition<T>;

/**
 * An expression whose result is determined by a boolean value
 */
type BooleanCondition = ObjectOrFnCondition<boolean>;

/**
 * dev will be true when running with command: 'serve' and mode: 'development'
 * preview will be true when running with command: 'test' and mode: 'developemnt'
 * build will be true when running with command: 'build' and mode: 'production'
 * preview will be true when running with command: 'serve' and mode: 'production'
 */
export type DefinedRule = 'dev' | 'test' | 'build' | 'preview';

/**
 * An expression whose result is determined by a string equal to some defined rule
 */
type DefinedRuleCondition = ObjectOrFnCondition<DefinedRule>;

/**
 * Condition passed by user
 */
export type Condition = BooleanCondition | DefinedRuleCondition;

/**
 * Description tuple passed by user
 */
export type DescriptionTuple =
  | [string, UserConfigExport, Condition]
  | [UserConfigExport, Condition];

/**
 * Description object passed by user
 */
export type DescriptionObject = {
  config: UserConfigExport;
  condition: Condition;
};

/**
 * User's config with usage of predefined rules
 */
export type SimpleDescriptions = Partial<Record<DefinedRule, UserConfigExport>>;

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
  transform(config: UserConfigExport): UserConfigFn;
}

export interface AbstractDescriptionTransformer {
  transform(description: DescriptionTuple): InnerDescription;
}

export interface AbstractBaseConfigurator {
  handle(...args: DescriptionTuple[] | [...DescriptionTuple[], { merge: boolean }]): UserConfigFn;
}

export interface AbstractMerger {
  merge(...configs: [UserConfigExport, ...UserConfigExport[]]): UserConfigFn;
  merge(...args: [UserConfigExport, ...UserConfigExport[], boolean]): UserConfigFn;
}

export type ConfiguratorFabricParams = {
  configTransformer: AbstractConfigTransformer;
  conditionTransformer: AbstractConditionTransformer;
  defaultLabel?: string;
};

export type MergeConfig = (
  defaults: UserConfig,
  overrides: UserConfig,
  isRoot?: boolean
) => UserConfig;

export type MergerFabricParams = {
  mergeConfig: MergeConfig;
};
