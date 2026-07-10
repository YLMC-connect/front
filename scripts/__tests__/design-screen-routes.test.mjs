import assert from "node:assert/strict";
import test from "node:test";
import { routeFor } from "../design-screen-routes.mjs";

test("uses a design-only query for visual variants", () => {
  assert.equal(
    routeFor({ component: "ScreenMarketList", variant: "network-error" }),
    "/market?designVariant=network-error",
  );
});

test("uses a real navigation query for the service segment", () => {
  assert.equal(
    routeFor({ component: "ScreenServiceList", variant: "" }),
    "/group?section=service",
  );
});

test("normalizes legacy inventory variant routes", () => {
  assert.equal(
    routeFor({
      component: "LegacyScreen",
      currentRoute: "/group/1?variant=member&source=inventory",
    }),
    "/group/1?source=inventory&designVariant=member",
  );
});
