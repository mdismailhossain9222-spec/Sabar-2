#!/usr/bin/env node
// Install community skills from travisvn/awesome-claude-skills list into ~/.claude/skills
import { mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const DEST = join(homedir(), ".claude", "skills");

async function get(url) {
  const res = await fetch(url, { headers: { accept: "application/vnd.github.v3+json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.url}`);
  return res.json();
}

async function downloadTree(url, destDir, prefix = "") {
  const items = await get(url);
  for (const item of items) {
    const rel = prefix ? `${prefix}/${item.name}` : item.name;
    const dest = join(destDir, rel);
    if (item.type === "dir") {
      await mkdir(dest, { recursive: true });
      await downloadTree(item.url, destDir, rel);
    } else if (item.type === "file") {
      const content = await fetch(item.download_url).then((r) => r.arrayBuffer());
      await mkdir(join(destDir, rel).replace(/[^/\\]+$/, ""), { recursive: true });
      await writeFile(join(destDir, rel), Buffer.from(content));
    }
  }
}

async function installSkill(repo, subpath, destName) {
  const dir = join(DEST, destName);
  if (existsSync(dir)) {
    console.log(`  SKIP (exists): ${destName}`);
    return;
  }
  await mkdir(dir, { recursive: true });
  const url = `https://api.github.com/repos/${repo}/contents/${subpath}`;
  console.log(`  Installing ${destName} from ${repo}/${subpath} ...`);
  await downloadTree(url, dir);
  console.log(`  OK: ${destName}`);
}

async function main() {
  // ios-simulator-skill: skill folder is ios-simulator-skill/skills/ios-simulator-skill
  await installSkill("conorluddy/ios-simulator-skill", "ios-simulator-skill/skills/ios-simulator-skill", "ios-simulator-skill");

  // ffuf: skill folder is ffuf-skill
  await installSkill("jthack/ffuf_claude_skill", "ffuf-skill", "ffuf-web-fuzzing");

  // claude-d3js-skill: SKILL.md + assets + references at root
  await installSkill("chrisvoncsefalvay/claude-d3js-skill", "", "claude-d3js-skill");

  // web-asset-generator: skills/web-asset-generator
  await installSkill("alonw0/web-asset-generator", "skills/web-asset-generator", "web-asset-generator");

  // frontend-slides: SKILL.md + supporting files at root
  await installSkill("zarazhangrui/frontend-slides", "", "frontend-slides");

  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });