#!/usr/bin/env bash

set -e

if [[ ! "$GITHUB_REF_TYPE" = "tag" ]]; then
  echo "Not a tag. Skipping deployment." >&2
  exit 1
fi

EXTENSION_VERSION=${GITHUB_REF_NAME#v}

if [[ -z "$EXTENSION_VERSION" ]]; then
  echo "Could not determine extension version from tag name." >&2
  exit 2
fi

echo "Building extension version $EXTENSION_VERSION..."

rm -rf dist *.zip
pnpm vite build
cd dist
zip -r "../follow-it-later.v${EXTENSION_VERSION}.zip" .