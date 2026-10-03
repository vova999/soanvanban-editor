// Local preferred-source rebuild. Never replaces the qualified runtime SDK.
import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const compile = require("google-closure-compiler-js");
const source = await readFile(resolve(here, "plugins.dev.js"), "utf8");
const result = compile({jsCode:[{src:source,path:"plugins.dev.js"}],compilationLevel:"SIMPLE",languageIn:"ECMASCRIPT_NEXT",languageOut:"ECMASCRIPT_2015"});
if (result.errors.length) throw new Error(JSON.stringify(result.errors));
const header = source.slice(0, source.indexOf("(function"));
const output = resolve(here, "dist/rebuilt-sdk.js");
await mkdir(dirname(output), { recursive:true });
await writeFile(output, header + result.compiledCode + "\n");
console.log(JSON.stringify({output,sha256:createHash("sha256").update(header + result.compiledCode + "\n").digest("hex"),warnings:result.warnings.length,byteIdenticalToOriginalDistribution:false,qualifiedForDeployment:false}));
