#!/usr/bin/env bash
# Minimal bump-version helper.
# Usage: ./scripts/bump-version.sh patch|minor|major [platform-suffix]
set -e
if [ -z "$1" ]; then
  echo "Usage: $0 patch|minor|major [platform-suffix]"
  exit 2
fi
TYPE=$1
SUFFIX=$2
# Read current version from package.json
CURRENT=$(node -p "require('./package.json').version")
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
case "$TYPE" in
  major) MAJOR=$((MAJOR+1)); MINOR=0; PATCH=0;;
  minor) MINOR=$((MINOR+1)); PATCH=0;;
  patch) PATCH=$((PATCH+1));;
  *) echo "Unknown type: $TYPE"; exit 2;;
esac
NEW="$MAJOR.$MINOR.$PATCH"
if [ -n "$SUFFIX" ]; then
  # Append platform suffix with an auto-incremented build number placeholder (teams can adjust)
  NEW_TAG="$NEW-$SUFFIX.001"
else
  NEW_TAG="$NEW"
fi
# Use npm to set version (updates package.json)
npm version --no-git-tag-version "$NEW"
# Commit version bump
git add package.json package-lock.json 2>/dev/null || true
git commit -m "chore(release): bump version to $NEW_TAG" || true
# Print tag to be created by release flow
echo "New version: $NEW"
if [ -n "$SUFFIX" ]; then
  echo "Suggested tag: $NEW_TAG"
else
  echo "Suggested tag: v$NEW"
fi
exit 0
