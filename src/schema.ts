import { z } from "zod";
import type { PackageJSON } from "@manypkg/tools";

const packageJsonSchema: z.ZodType<PackageJSON> = z.any();

const replacementContextSchema = z.object({
  packageJson: packageJsonSchema,
  json: z.any(),
});

export type ReplacementContext = z.infer<typeof replacementContextSchema>;

const replacementFunctionSchema = z
  .function()
  .args(replacementContextSchema)
  .returns(z.any());

export type ReplacementFunction = z.infer<typeof replacementFunctionSchema>;

const replacementSchema = z.object({
  selector: z.string(),
  value: z.string(),
});

export const moyareConfigsSchema = z.array(
  z.object({
    file: z.string(),
    replacements: z.array(replacementSchema).optional(),
    replacementFunctions: z.array(replacementFunctionSchema).optional(),
  })
);

export type MoyareConfigs = z.infer<typeof moyareConfigsSchema>;
