// Finishes custom-elements.json after `cem analyze`: a stable module order
// (CI checks the committed file is current), and game/global.mjs as the
// module that registers every tag (`custom-element-definition` exports), so
// a tool knows what to load for an element.
import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../custom-elements.json", import.meta.url);
const manifest = JSON.parse(await readFile(FILE, "utf8"));
manifest.modules = manifest.modules.filter((mod) => mod.path !== "game/global.mjs");
const definitions = manifest.modules.flatMap((mod) =>
  (mod.declarations ?? [])
    .filter((d) => d.customElement && d.tagName)
    .map((d) => ({ kind: "custom-element-definition", name: d.tagName, declaration: { name: d.name, module: mod.path } })),
);
for (const mod of manifest.modules) mod.exports = (mod.exports ?? []).filter((e) => e.kind !== "custom-element-definition");
manifest.modules.push({ kind: "javascript-module", path: "game/global.mjs", declarations: [], exports: definitions });
manifest.modules.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(FILE, JSON.stringify(manifest, null, 2) + "\n");
