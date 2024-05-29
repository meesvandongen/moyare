import type { Package } from "@manypkg/get-packages";
import type { MoyareConfigs } from "./schema";

export interface PackageConfig {
  pkg: Package;
  configs: MoyareConfigs;
}

export interface FailureResult {
  errors: string[];
  packageName: string;
  packagePath: string;
  path: string;
}
