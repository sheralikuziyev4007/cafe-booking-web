#!/usr/bin/env bash
# Run from the project root:  bash push-to-github.sh
set -euo pipefail

REPO_URL="https://github.com/sheralikuziyev4007/cafe-booking-web.git"

git config user.name "Sherali Kuziyev"
git config user.email "sheralikuziyev618@gmail.com"

# Make sure everything works before publishing
npm ci
npm run check

git add -A
git commit -m "docs: fix test count in README and add .env.example and .nvmrc" || echo "Nothing to commit"

git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git push -u origin main
