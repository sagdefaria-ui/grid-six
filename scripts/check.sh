#!/usr/bin/env bash
# Verificação antes de publicar: sintaxe do JS, Leaflet presente e versão coerente.
set -euo pipefail
cd "$(dirname "$0")/.."
node -e '
const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/<script>\n\(function\(\)\{[\s\S]*?\}\)\(\);\n<\/script>/);
if (!m) { console.error("ERRO: bloco principal de script não encontrado"); process.exit(1); }
try { new Function(m[0].replace("<script>", "").replace("</script>", "")); }
catch (e) { console.error("ERRO de sintaxe no JS:", e.message); process.exit(1); }
for (const need of ["leaflet.min.css", "leaflet.min.js"]) {
  if (!html.includes(need)) { console.error("ERRO: falta " + need); process.exit(1); }
}
const inApp = (html.match(/var APP_VERSION = \x27([^\x27]+)\x27/) || [])[1];
const inFile = JSON.parse(fs.readFileSync("version.json", "utf8")).version;
if (!inApp || inApp !== inFile) {
  console.error("ERRO: APP_VERSION (" + inApp + ") diferente de version.json (" + inFile + ")");
  process.exit(1);
}
console.log("OK — versão " + inApp);
'
