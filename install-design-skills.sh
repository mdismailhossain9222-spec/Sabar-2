#!/usr/bin/env bash
# Install all design skills from bergside/awesome-design-skills into ~/.claude/skills
set -euo pipefail

BASE="https://raw.githubusercontent.com/bergside/awesome-design-skills/main/skills"
DEST="$HOME/.claude/skills"
INDEX="/tmp/design-skills-index.json"

echo "Fetching index.json..."
curl -fsSL "https://raw.githubusercontent.com/bergside/awesome-design-skills/main/skills/index.json" -o "$INDEX"

total=$(node -e "console.log(Object.keys(require('$INDEX')).length)")
echo "Found $total skills in registry."

ok=0
fail=0
while IFS= read -r slug; do
  dir="$DEST/$slug"
  # Replace any existing symlink with a real directory
  if [ -L "$dir" ] || [ -e "$dir" ]; then
    rm -rf "$dir"
  fi
  mkdir -p "$dir"
  sm="$dir/SKILL.md"
  dm="$dir/DESIGN.md"

  s_ok=0; d_ok=0
  if curl -fsSL "$BASE/$slug/SKILL.md" -o "$sm" 2>/dev/null; then s_ok=1; fi
  if curl -fsSL "$BASE/$slug/DESIGN.md" -o "$dm" 2>/dev/null; then d_ok=1; fi

  if [ "$s_ok" = "1" ] && [ "$d_ok" = "1" ]; then
    ok=$((ok+1))
  else
    fail=$((fail+1))
    echo "  PARTIAL/FAIL: $slug (skill=$s_ok design=$d_ok)"
  fi
done < <(node -e "console.log(Object.keys(require('$INDEX')).join('\n'))")

echo ""
echo "Done. Installed: $ok / $total"
echo "Failed/partial: $fail"
echo "Destination: $DEST"