#!/usr/bin/env node

import { getPackages } from "@manypkg/get-packages";
import { parse } from "yaml";
import { yamlOverwrite } from "yaml-diff-patch";
import { readFileSync, writeFileSync } from "fs";
import { cosmiconfig } from "cosmiconfig";
import { moyareConfigsSchema, type ReplacementContext } from "./schema";
import { join } from "path";
import template from "lodash.template";
import set from "lodash.set";
import type { PackageConfig, FailureResult } from "./types";
import { createFailureResult, printFailureResults } from "./error";

async function main() {
  const { packages } = await getPackages(process.cwd());

  if (packages.length === 0) {
    throw new Error("No packages found");
  }

  const packagesConfigs: PackageConfig[] = [];
  const failureResults: FailureResult[] = [];

  for (const pkg of packages) {
    const cosmicConfigResult = await cosmiconfig("moyare", {
      searchStrategy: "none",
    }).search(pkg.dir);

    if (!cosmicConfigResult) {
      continue;
    }

    if (cosmicConfigResult.isEmpty) {
      continue;
    }

    const parsedConfigResult = moyareConfigsSchema.safeParse(
      cosmicConfigResult.config
    );

    if (parsedConfigResult.success) {
      packagesConfigs.push({
        pkg,
        configs: parsedConfigResult.data,
      });
    } else {
      const failureResult: FailureResult = createFailureResult(
        parsedConfigResult.error.errors,
        pkg,
        cosmicConfigResult
      );

      failureResults.push(failureResult);
    }
  }

  if (failureResults.length > 0) {
    printFailureResults(failureResults);
    process.exit(1);
  }

  if (packagesConfigs.length === 0) {
    console.error("No valid configs found");
    process.exit(0);
  }

  packagesConfigs.forEach(({ pkg, configs }) => {
    configs.forEach((config) => {
      const filePath = join(pkg.dir, config.file);
      console.log(`Processing ${filePath}`);
      const fileText = readFileSync(filePath, "utf8");
      let fileObject = parse(fileText);

      config.replacements?.forEach((replacement) => {
        const context: ReplacementContext = {
          packageJson: pkg.packageJson,
          json: fileObject,
        };

        const interpretedSelector = template(replacement.selector)(context);
        const interpretedValue = template(replacement.value)(context);

        fileObject = set(fileObject, interpretedSelector, interpretedValue);
      });

      config.replacementFunctions?.forEach((replacementFunction) => {
        console.log(`Running replacement function`);
        const context: ReplacementContext = {
          packageJson: pkg.packageJson,
          json: fileObject,
        };

        fileObject = replacementFunction(context);
      });

      const newYaml = yamlOverwrite(fileText, fileObject);

      writeFileSync(filePath, newYaml);
    });
  });
}

main();
