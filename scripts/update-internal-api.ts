import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { OpenAPIHono } from "@hono/zod-openapi";
import openapiTS, { astToString, type OpenAPI3 } from "openapi-typescript";
import * as r from "../src/backend/routes";
import { InternalApiConfig } from "./internal-api.config";

const app = new OpenAPIHono({});

for (const route of Object.values(r)) {
  // @ts-expect-error not mean to be functional
  app.openapi(route, async (c) => {});
}

const schema = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "foo", description: "bar", version: "1" },
});

const ast = await openapiTS(schema as OpenAPI3, {});
const contents = astToString(ast);
await mkdir(dirname(InternalApiConfig.generatedPath), { recursive: true });
await writeFile(
  InternalApiConfig.generatedPath,
  // @ts-ignore
  `// Auto-generated by ${basename(fileURLToPath(import.meta.url))}, please do not modify by hand.
 
export const baseUrl = ${JSON.stringify(InternalApiConfig.root)};

${contents}`
);
