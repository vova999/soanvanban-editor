// Creates only a reviewed LOCAL preparation bundle; never contacts a hosting service.
import { readFile, lstat, mkdir, copyFile, readdir, writeFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, basename, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
const root = await realpath(fileURLToPath(new URL("..", import.meta.url)));
const plan = JSON.parse(await readFile(resolve(root, "docs/EDITOR-SOURCE-PLAN.json"), "utf8"));
const files = [];
for (const path of [...plan.localFiles].sort()) {
  if (path.split("/").some(segment => !segment || segment === "." || segment === "..")) throw new Error("Noncanonical input path: " + path);
  if (!/^(components\/(editor-plugin|vietnamese-mappings)\/|deploy\/euro-office\/|scripts\/(editor-source-(plan\.mjs|fetch\.py)|filter-editor-archives\.py)$|docs\/(CODE-SEPARATION\.md|EDITOR-INTERFACE\.md|EDITOR-SOURCE-PLAN\.json|EDITOR-UPSTREAM-SOURCES\.json|EDITOR-FONT-INVENTORY\.json|PUBLICATION-REVIEW\.md)$)/.test(path) || /(^|\/)(\.env[^/]*|\.git|node_modules|data|backups|artifacts|built|source)(\/|$)/.test(path) || /\.(sqlite|db|tar|gz|ttf|otf|woff2?)$/.test(path))
    throw new Error("Not a reviewed public-package input: " + path);
  const absolute = resolve(root, path), rel = relative(root, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new Error("Path outside package");
  // Reject symlinks in every ancestor, not only the leaf.
  let current = root;
  for (const segment of rel.split("/")) {
    current = resolve(current, segment);
    if ((await lstat(current)).isSymbolicLink()) throw new Error("Symlink input: " + path);
  }
  if (!(await lstat(absolute)).isFile()) throw new Error("Not a source file: " + path);
  const content = await readFile(absolute);
  files.push({ path, bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") });
}
const manifest = { ...plan, localFiles: files, completeCorrespondingSource: false, deploymentAllowed: false };
if (process.argv[2]) {
  const requested = resolve(process.argv[2]);
  // Resolve aliases such as macOS /tmp -> /private/tmp before checking containment.
  const output = resolve(await realpath(dirname(requested)), basename(requested));
  const rel = relative(root, output);
  if (!rel.startsWith("..") && !isAbsolute(rel)) throw new Error("Use a separate staging directory outside the application");
  await mkdir(output, { recursive: true, mode: 0o700 });
  if ((await lstat(output)).isSymbolicLink() || (await readdir(output)).length) throw new Error("Staging directory must be empty and not a symlink");
  for (const { path } of files) {
    await mkdir(dirname(resolve(output, path)), { recursive: true });
    await copyFile(resolve(root, path), resolve(output, path));
  }
  await writeFile(resolve(output, "LOCAL-PREPARATION-MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
}
console.log(JSON.stringify(manifest, null, 2));
