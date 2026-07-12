import assert from "node:assert/strict";
import test from "node:test";
import { findDevClientOverlay } from "../capture-ui-state.mjs";

test("detects each Expo Dev Client overlay label", () => {
  assert.deepEqual(
    findDevClientOverlay(
      '<node text="DEVELOPMENT SERVERS" bounds="[10,20][110,80]" />',
    ),
    { state: "development-servers", center: { x: 60, y: 50 } },
  );
  assert.deepEqual(
    findDevClientOverlay(
      '<node content-desc="Continue" bounds="[464,2145][617,2190]" />',
    ),
    { state: "continue", center: { x: 541, y: 2168 } },
  );
  assert.deepEqual(
    findDevClientOverlay('<node text="Reload" bounds="[700,900][900,1000]" />'),
    { state: "reload", center: { x: 800, y: 950 } },
  );
});

test("ignores application screens without a Dev Client overlay", () => {
  const hierarchy = `
    <node resource-id="screen-market" text="나눔" />
    <node content-desc="토요 산악회" />
  `;

  assert.equal(findDevClientOverlay(hierarchy), null);
});
