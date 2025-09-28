#!/usr/bin/env bash
set -euo pipefail

# Guardrails to prevent mint/emerald from reappearing and white text on yellow surfaces
# Requires ripgrep (rg)

# 1) Block mint/emerald tokens
if rg -n "(mint|emerald|#00E5A0)" app -S; then
  echo "❌ Mint/emerald token detected. Replace with purple/pink as appropriate." >&2
  exit 1
fi

# 2) Block white text in pages/components (allow white text when on purple bg explicitly)
if rg -n "text-white" app/pages app/components -S | rg -v "bg-\[var\(--purple\)\]"; then
  echo "❌ text-white found in pages/components (avoid white on yellow/ivory)." >&2
  exit 1
fi

# 3) Tailwind emerald classes
if rg -n "ring-emerald|border-emerald|from-emerald|to-emerald" app -S; then
  echo "❌ Emerald Tailwind classes detected." >&2
  exit 1
fi

echo "✅ Style guard passed."
