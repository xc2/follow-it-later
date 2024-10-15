import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pick } from "lodash-es";
import openapiTS, { astToString, type OpenAPI3, type PathsObject } from "openapi-typescript";
import { FollowApiConfig } from "./follow-api.config";

const doc = (await (await fetch(FollowApiConfig.spec)).json()) as OpenAPI3;

doc.paths = pick(doc.paths || {}, FollowApiConfig.paths) as PathsObject;

const ast = await openapiTS(doc, {});
const contents = astToString(ast);
await mkdir(dirname(FollowApiConfig.generatedPath), { recursive: true });
await writeFile(
  FollowApiConfig.generatedPath,
  // @ts-ignore
  `// Auto-generated by ${basename(fileURLToPath(import.meta.url))}, please do not modify by hand.
 
export const baseUrl = ${JSON.stringify(FollowApiConfig.root)};

${contents}`
);