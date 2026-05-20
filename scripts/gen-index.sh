#!/usr/bin/env bash
# scripts/gen-index.sh
# docs/INDEX.md 의 "도메인 상태표" 섹션을 GitHub Issues 데이터로 자동 갱신.
#
# 마커 사이를 교체:
#   <!-- AUTO-GENERATED-START: domain-status -->
#   ...
#   <!-- AUTO-GENERATED-END: domain-status -->
#
# 사용:
#   bash scripts/gen-index.sh
#
# 요구사항: gh CLI 로그인됨 (`gh auth login`), jq 설치됨.
# 인증 안 됐어도 동작은 하되 카운트가 "?" 로 표시됨.

set -euo pipefail

INDEX="docs/INDEX.md"
START_MARKER="<!-- AUTO-GENERATED-START: domain-status -->"
END_MARKER="<!-- AUTO-GENERATED-END: domain-status -->"

DOMAINS=(common auth market group life-study prayer)

domain_label() {
  case "$1" in
    common)     echo "common (공통 인프라)" ;;
    auth)       echo "auth (인증)" ;;
    market)     echo "market (나눔장터)" ;;
    group)      echo "group (소모임)" ;;
    life-study) echo "life-study (삶공부)" ;;
    prayer)     echo "prayer (중보기도)" ;;
    *)          echo "$1" ;;
  esac
}

GH_OK=0
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  GH_OK=1
fi

TMP=$(mktemp)
{
  echo ""
  echo "| 도메인 | 진행 중 | 완료 | 마지막 갱신 | 상세 |"
  echo "|---|---|---|---|---|"
  for d in "${DOMAINS[@]}"; do
    name=$(domain_label "$d")

    if [ "$GH_OK" = "1" ]; then
      open_count=$(gh issue list --label "$d" --state open --limit 200 --json number --jq 'length' 2>/dev/null || echo 0)
      closed_count=$(gh issue list --label "$d" --state closed --limit 200 --json number --jq 'length' 2>/dev/null || echo 0)
      last=$(gh issue list --label "$d" --state all --limit 200 --json updatedAt --jq 'if length == 0 then "—" else (max_by(.updatedAt).updatedAt[0:10]) end' 2>/dev/null || echo "—")
      [ -z "$last" ] && last="—"
    else
      open_count="?"
      closed_count="?"
      last="—"
    fi

    if [ -f "docs/features/$d.md" ]; then
      detail="[features/$d.md](features/$d.md)"
    else
      detail="(미생성)"
    fi

    echo "| $name | $open_count | $closed_count | $last | $detail |"
  done
  echo ""
} > "$TMP"

awk -v start="$START_MARKER" -v end="$END_MARKER" -v tmpfile="$TMP" '
  BEGIN { in_block = 0 }
  $0 == start {
    print
    while ((getline line < tmpfile) > 0) print line
    close(tmpfile)
    in_block = 1
    next
  }
  $0 == end {
    in_block = 0
    print
    next
  }
  !in_block { print }
' "$INDEX" > "$INDEX.new" && mv "$INDEX.new" "$INDEX"

rm -f "$TMP"

if [ "$GH_OK" = "1" ]; then
  echo "✓ $INDEX 도메인 상태표 갱신 완료 (Issues 기반)"
else
  echo "⚠ gh CLI 미인증 — 카운트는 '?' 로 채움. 'gh auth login' 후 재실행하세요."
fi
