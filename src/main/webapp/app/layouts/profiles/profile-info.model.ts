/** Raw JSON response from the `/management/info` endpoint. */
export interface InfoResponse {
  'display-ribbon-on-profiles'?: string;
  git?: any;
  build?: any;
  activeProfiles?: string[];
}

/** Derived profile metadata used by layout components. */
export class ProfileInfo {
  constructor(
    public activeProfiles?: string[],
    public ribbonEnv?: string,
    public inProduction?: boolean,
    public openAPIEnabled?: boolean,
  ) {}
}
