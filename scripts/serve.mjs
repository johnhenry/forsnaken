// A tiny static server for this folder (no caching), for development and tests.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = Number(process.env.PORT) || 4820;
const TYPES = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".md": "text/markdown" };

createServer(async (request, response) => {
  let path = normalize(join(ROOT, decodeURIComponent(new URL(request.url, "http://x").pathname)));
  if (!path.startsWith(ROOT)) return response.writeHead(403).end();
  try {
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    // CORS like GitHub Pages, so tools on other origins (a page builder) can load it.
    response.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream", "cache-control": "no-store", "access-control-allow-origin": "*" }).end(body);
  } catch {
    response.writeHead(404).end("not found");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}/`));
