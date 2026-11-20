#!/usr/bin/env node
// Install all design skills from bergside/awesome-design-skills into ~/.claude/skills
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const BASE = "https://raw.githubusercontent.com/bergside/awesome-design-skills/main/skills";
const INDEX_URL = "https://raw.githubusercontent.com/bergside/awesome-design-skills/main/skills/index.json";
const DEST = join(homedir(), ".claude", "skills");

async function fetchText(url) {
  const res = await fetch(url, { headers: { accept: "text/plain, application/json, */*" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  console.log("Fetching index.json...");
  const index = JSON.parse(await fetchText(INDEX_URL));
  const slugs = Object.keys(index);
  console.log(`Found ${slugs.length} skills in registry.`);

  let ok = 0, fail = 0;
  for (const slug of slugs) {
    const dir = join(DEST, slug);
    // Replace any existing symlink/dir with a real directory
    if (existsSync(dir)) {
      await rm(dir, { recursive: true, force: true });
    }
    await mkdir(dir, { recursive: true });
    const sm = join(dir, "SKILL.md");
    const dm = join(dir, "DESIGN.md");

    let sOk = false, dOk = false;
    try {
      await writeFile(sm, await fetchText(`${BASE}/${slug}/SKILL.md`));
      sOk = true;
    } catch (e) { console.log(`  FAIL skill: ${slug}: ${e.message}`); }
    try {
      await writeFile(dm, await fetchText(`${BASE}/${slug}/DESIGN.md`));
      dOk = true;
    } catch (e) { console.log(`  FAIL design: ${slug}: ${e.message}`); }

    if (sOk && dOk) {
      ok++;
    } else {
      fail++;
    }
  }

  console.log(`\nDone. Installed: ${ok} / ${slugs.length}`);
  console.log(`Failed/partial: ${fail}`);
  console.log(`Destination: ${DEST}`);
}

main().catch((e) => { console.error(e); process.exit(1); });