/**
 * ADML Mod-Templet Build & Validate Script
 * 
 * Validates manifest.json (apiVersion === "1"), packages the template into a ZIP file 
 * named after manifest.name and version.
 */

import fs from "fs";
import path from "path";
import JSZip from "jszip";

const targetDir = process.argv[2] || process.cwd();
const outputDir = path.join(targetDir, "dist");

async function buildTemplate() {
  const manifestPath = path.join(targetDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: manifest.json not found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`Building template plugin: "${manifest.name}" (ID: ${manifest.id}, v${manifest.version})`);

  if (manifest.apiVersion !== "1") {
    console.error(`Error: Invalid apiVersion "${manifest.apiVersion}". Expected "1".`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const zip = new JSZip();
  const entries = fs.readdirSync(targetDir);

  for (const entry of entries) {
    if (entry === "dist" || entry === ".git" || entry.startsWith(".")) continue;
    const fullPath = path.join(targetDir, entry);
    if (fs.statSync(fullPath).isFile()) {
      zip.file(entry, fs.readFileSync(fullPath));
    }
  }

  // Use manifest.name for ZIP filename (sanitized for file systems)
  const safeName = (manifest.name || manifest.id || "plugin")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
  const zipName = `${safeName}-${manifest.version || "1.0.0"}.zip`;
  const outputPath = path.join(outputDir, zipName);

  const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(outputPath, content);

  console.log(`[SUCCESS] Templet ZIP generated: ${outputPath}`);
}

buildTemplate().catch(err => {
  console.error("[FATAL]", err);
  process.exit(1);
});
