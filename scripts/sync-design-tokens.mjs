#!/usr/bin/env node
// 디자인 시스템 tokens.json(design-system/tokens.json) → 앱 토큰(src/constants/designTokens.json).
// 디자인 시스템이 바뀌면 design-system/tokens.json 을 새 파일로 바꾸고 `node scripts/sync-design-tokens.mjs` 를 돌린다.
// 이름 규칙은 ADR 0007: kebab-case → camelCase, 그룹 접두어(space-, radius-, shadow-, z-, opacity-, duration-)는 뺀다.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE = join(ROOT, "design-system/tokens.json");
export const TARGET = join(ROOT, "src/constants/designTokens.json");

// RN 은 CSS 그림자 문자열에서 elevation 을 알 수 없어 이름별로 정한다.
const ELEVATION = { sm: 2, md: 4, lg: 8, sheet: 12 };

const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const strip = (name, prefix) => camel(name.slice(prefix.length));
const px = (value) => Number.parseFloat(value);

function toShadow(name, value) {
  const match = value.match(
    /^(-?\d+)(?:px)? (-?\d+)(?:px)? (\d+)(?:px)? rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/,
  );
  if (!match) throw new Error(`알 수 없는 그림자 형식: ${name} = ${value}`);
  const [, x, y, blur, r, g, b, a] = match;
  return {
    shadowColor: `rgb(${r},${g},${b})`,
    shadowOffset: { width: Number(x), height: Number(y) },
    shadowOpacity: Number(a),
    shadowRadius: Number(blur) / 2,
    elevation: ELEVATION[name] ?? 0,
  };
}

const collect = (tokens, key, value) =>
  Object.fromEntries(tokens.map((t) => [key(t.name), value(t)]));

export function buildAppTokens(ds) {
  const text = ds.type.groups.find((g) => g.name === "Text").styles;
  return {
    version: ds.version,
    colors: collect(ds.color.tokens, camel, (t) => t.value),
    typography: collect(
      text,
      (n) => n,
      (s) => ({
        fontSize: px(s.fontSize),
        lineHeight: px(s.lineHeight),
        fontWeight: String(s.fontWeight),
      }),
    ),
    spacing: collect(
      ds.spacing.tokens,
      (n) => strip(n, "space-"),
      (t) => px(t.value),
    ),
    radius: collect(
      ds.radius.tokens,
      (n) => strip(n, "radius-"),
      (t) => px(t.value),
    ),
    shadow: collect(
      ds.shadow.tokens,
      (n) => strip(n, "shadow-"),
      (t) => toShadow(strip(t.name, "shadow-"), t.value),
    ),
    size: collect(ds.size.tokens, camel, (t) => px(t.value)),
    zIndex: collect(
      ds.zIndex.tokens,
      (n) => strip(n, "z-"),
      (t) => Number(t.value),
    ),
    opacity: collect(
      ds.opacity.tokens,
      (n) => strip(n, "opacity-"),
      (t) => Number(t.value),
    ),
    duration: collect(
      ds.duration.tokens,
      (n) => n.replace(/^duration-/, ""),
      (t) => px(t.value),
    ),
  };
}

export const serialize = (tokens) => `${JSON.stringify(tokens, null, 2)}\n`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ds = JSON.parse(readFileSync(SOURCE, "utf8"));
  writeFileSync(TARGET, serialize(buildAppTokens(ds)));
  console.log(`✓ ${TARGET} 갱신 (디자인 시스템 토큰 v${ds.version})`);
}
