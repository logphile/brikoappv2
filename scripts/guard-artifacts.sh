#!/usr/bin/env bash
set -euo pipefail

ARTIFACT_DIR=".output/public"
MAX_MB=350  # adjust if needed

if [ ! -d "$ARTIFACT_DIR" ]; then
  echo "Artifact dir not found: $ARTIFACT_DIR"
  exit 1
fi

SIZE_MB=$(du -sm "$ARTIFACT_DIR" | awk '{print $1}')
if [ "$SIZE_MB" -gt "$MAX_MB" ]; then
  echo "Artifact too large: ${SIZE_MB} MB (limit ${MAX_MB} MB)"
  echo "Top 30 largest files:"
  find "$ARTIFACT_DIR" -type f -printf '%s %p\n' | sort -nr | head -n 30 | awk '{ printf "%8.1f MB  %s\n", $1/1024/1024, $2 }'
  exit 2
fi

echo "Artifact size OK: ${SIZE_MB} MB (limit ${MAX_MB} MB)"
