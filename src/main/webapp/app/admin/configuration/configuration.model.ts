/** Response from `/management/configprops` listing all Spring configuration beans. */
export interface ConfigProps {
  contexts: Contexts;
}

export type Contexts = Record<string, Context>;

export interface Context {
  beans: Beans;
  parentId?: any;
}

export type Beans = Record<string, Bean>;

/** A Spring configuration properties bean with its prefix and resolved values. */
export interface Bean {
  /** The `@ConfigurationProperties` prefix (e.g. 'spring.datasource'). */
  prefix: string;
  /** Resolved property values for this bean. */
  properties: any;
}

/** Response from `/management/env` listing active profiles and property sources. */
export interface Env {
  /** Currently active Spring profiles (e.g. ['dev']). */
  activeProfiles?: string[];
  /** Ordered list of property sources (highest priority first). */
  propertySources: PropertySource[];
}

/** A single Spring property source (e.g. application.yml, system environment). */
export interface PropertySource {
  name: string;
  properties: Properties;
}

export type Properties = Record<string, Property>;

export interface Property {
  value: string;
  origin?: string;
}
