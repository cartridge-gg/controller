import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const artifacts = path.join(here, ".artifacts");
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".wasm": "application/wasm",
};

function staticServer(root, port, rewrite) {
  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (rewrite) relative = rewrite(relative);
    let file = path.resolve(root, relative || "index.html");
    if (!file.startsWith(path.resolve(root)) || !existsSync(file)) {
      response.writeHead(404).end("Not found");
      return;
    }
    if (statSync(file).isDirectory()) file = path.join(file, "index.html");
    response.setHeader(
      "content-type",
      contentTypes[path.extname(file)] ?? "application/octet-stream",
    );
    response.setHeader("cache-control", "no-store");
    createReadStream(file).pipe(response);
  }).listen(port, "127.0.0.1");
}

staticServer(path.join(artifacts, "hosts"), 4173);
staticServer(path.join(artifacts, "keychain"), 4174, (relative) =>
  relative === "compat.html" ? "compat.html" : relative,
);

console.log("Compatibility hosts listening on 4173 and keychain on 4174");
