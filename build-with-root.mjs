import fs from "fs";
import path from "path";
import JSZip from "jszip";
import crypto from "crypto";

async function build() {
  const targetDir = process.argv[2] || ".";
  const manifestPath = path.join(targetDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("Error: manifest.json not found in " + targetDir);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (manifest.apiVersion !== "1") {
    console.error(`Error: Invalid apiVersion "${manifest.apiVersion}". Expected "1".`);
    process.exit(1);
  }

  const zip = new JSZip();
  const excludeFiles = new Set([".git", "node_modules", "dist", ".github", "build.mjs", "build-with-root.mjs", "root.json"]);

  function addRecursive(dir, currentZip) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (currentZip === zip && excludeFiles.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subZip = currentZip.folder(entry.name);
        addRecursive(fullPath, subZip);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        currentZip.file(entry.name, content);
      }
    }
  }

  addRecursive(targetDir, zip);
  const zipContent = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  const safeName = (manifest.name || manifest.id || "plugin").replace(/[^a-z0-9._-]/gi, "_");
  const version = manifest.version || "1.0.0";
  const distDir = path.join(targetDir, "dist");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const zipFilename = `${safeName}-${version}.zip`;
  const zipPath = path.join(distDir, zipFilename);
  fs.writeFileSync(zipPath, zipContent);

  const sha256 = crypto.createHash("sha256").update(zipContent).digest("hex");
  console.log(`Successfully built ${zipFilename} (SHA256: ${sha256})`);

  // Handle root.json catalog
  const rootJsonPath = path.join(targetDir, "root.json");
  let rootData = {
    schemaVersion: "1",
    plugin: {
      id: manifest.id,
      name: manifest.name,
      apiVersion: manifest.apiVersion,
      description: manifest.description || ""
    },
    latest: null,
    versions: []
  };

  if (fs.existsSync(rootJsonPath)) {
    try {
      rootData = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
    } catch(e) {}
  }

  const releaseEntry = {
    version: version,
    tag: `v${version}`,
    download: `./dist/${zipFilename}`,
    releasedAt: new Date().toISOString(),
    sha256: sha256
  };

  rootData.latest = releaseEntry;
  // Prepend or replace version
  rootData.versions = rootData.versions.filter(v => v.version !== version);
  rootData.versions.unshift(releaseEntry);

  fs.writeFileSync(rootJsonPath, JSON.stringify(rootData, null, 2), "utf-8");
  console.log("Updated root.json successfully.");
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
