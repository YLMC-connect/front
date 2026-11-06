import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SOURCE,
  TARGET,
  buildAppTokens,
  serialize,
} from "../sync-design-tokens.mjs";

const ds = JSON.parse(readFileSync(SOURCE, "utf8"));

test("committed app tokens match the design system source", () => {
  assert.equal(
    readFileSync(TARGET, "utf8"),
    serialize(buildAppTokens(ds)),
    "design-system/tokens.json 과 다릅니다. node scripts/sync-design-tokens.mjs 를 실행하세요.",
  );
});

test("converts names to camelCase without group prefixes", () => {
  const tokens = buildAppTokens(ds);
  assert.equal(tokens.colors.textMuted, "#626975");
  assert.equal(tokens.colors.primary50, "#f1f4fb");
  assert.equal(tokens.spacing["4"], 16);
  assert.equal(tokens.radius.full, 9999);
  assert.equal(tokens.zIndex.barFade, 4);
  assert.equal(tokens.size.buttonHeightSm, 44);
  assert.equal(tokens.duration.stagger, 60);
});

test("converts CSS shadows to React Native shadow props", () => {
  assert.deepEqual(buildAppTokens(ds).shadow.sheet, {
    shadowColor: "rgb(25,31,40)",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  });
});
