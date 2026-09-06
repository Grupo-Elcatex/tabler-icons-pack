#!/usr/bin/env bash
# Downloads a given @tabler/icons release from npm into vendor/tabler-icons and rebuilds src/, png/ and metadata/.
# Usage: ./update/sync.sh [version]   (default: latest)
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION="${1:-latest}"
rm -rf vendor && mkdir -p vendor
TGZ=$(cd vendor && npm pack "@tabler/icons@${VERSION}" --silent)
tar -xzf "vendor/${TGZ}" -C vendor && mv vendor/package vendor/tabler-icons && rm "vendor/${TGZ}"
RESOLVED=$(node -p "require('./vendor/tabler-icons/package.json').version")
echo "Synced @tabler/icons@${RESOLVED}"
npm install --silent
rm -rf src png metadata
node update/build.mjs vendor/tabler-icons
node -e "const p=require('./package.json');p.version='${RESOLVED}';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
echo "Done. Review with: git status --short | head"
