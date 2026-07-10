import { existsSync, readFileSync } from "node:fs";

const DEFAULT_INVENTORY_PATH =
  "/private/tmp/ylmc-golden-screens/2026-05-23/inventory.json";
const DEFAULT_ORIGINAL_MANIFEST_PATH =
  "/private/tmp/ylmc-golden-screens/2026-05-23/original/manifest.json";

const DESIGN_VARIANT_PARAM = "designVariant";

const withDesignVariant = (path, variant) =>
  variant
    ? `${path}?${DESIGN_VARIANT_PARAM}=${encodeURIComponent(variant)}`
    : path;

const normalizeDesignRoute = (route) => {
  if (!route || !route.includes("?")) return route;
  const [path, query] = route.split("?", 2);
  const params = new URLSearchParams(query);
  const legacyVariant = params.get("variant");
  if (legacyVariant && !params.has(DESIGN_VARIANT_PARAM)) {
    params.set(DESIGN_VARIANT_PARAM, legacyVariant);
    params.delete("variant");
  }
  const normalizedQuery = params.toString();
  return normalizedQuery ? `${path}?${normalizedQuery}` : path;
};

export const routeFor = (screen) => {
  if (screen.component === "ScreenPrayerList") {
    return "/prayer";
  }

  if (screen.component === "ScreenStudyList") {
    return "/life-study";
  }

  if (screen.currentRoute || screen.routeProposal) {
    return normalizeDesignRoute(screen.currentRoute || screen.routeProposal);
  }

  const { component, variant } = screen;

  switch (component) {
    case "ScreenSplash":
      return "/splash";
    case "ScreenLogin":
      return withDesignVariant("/login", variant);
    case "ScreenInviteCode":
      return withDesignVariant("/invite-code", variant);
    case "ScreenTerms":
      return "/terms";
    case "ScreenTermsSheet":
      return "/terms-sheet";
    case "ScreenSignup":
      return withDesignVariant("/signup", variant);
    case "ScreenHome":
      return "/";
    case "ScreenNotifications":
      return "/notifications";
    case "ScreenMarketList":
      return withDesignVariant("/market", variant);
    case "ScreenMarketDetail":
      return withDesignVariant("/market/1", variant);
    case "ScreenMarketCreate":
      return withDesignVariant("/modal/market-new", variant);
    case "ScreenGroupList":
      return withDesignVariant("/group", variant);
    case "ScreenServiceList":
      return "/group?section=service";
    case "ScreenGroupDetail":
      return withDesignVariant("/group/1", variant);
    case "ScreenGroupCreate":
      return withDesignVariant("/modal/group-new", variant);
    case "ScreenGroupNotices":
      return withDesignVariant("/group/notices", variant);
    case "ScreenGroupMembers":
      return withDesignVariant("/group/members", variant);
    case "ScreenPrayerList":
      return "/prayer";
    case "ScreenPrayerDetail":
      return "/prayer/1";
    case "ScreenPrayerApply":
      return "/prayer/apply";
    case "ScreenPrayerRequest":
      return "/prayer/request";
    case "ScreenPrayerWrite":
      return "/modal/prayer-new";
    case "ScreenStudyList":
      return "/life-study";
    case "ScreenStudyDetail":
      return "/life-study/1";
    case "ScreenStudyApply":
      return "/life-study/apply";
    case "ScreenStudyHistory":
      return "/life-study/history";
    case "ScreenMyPage":
      return withDesignVariant("/mypage", variant);
    case "ScreenLogoutConfirm":
      return "/mypage?designVariant=logout-confirm";
    case "ScreenEditProfile":
      return withDesignVariant("/mypage/edit", variant);
    case "ScreenActivity":
      return withDesignVariant("/mypage/activity", variant);
    case "ScreenBlocked":
      return withDesignVariant("/mypage/blocked", variant);
    case "ScreenFAQ":
      return withDesignVariant("/mypage/faq", variant);
    case "ScreenTerms2":
      return "/mypage/terms";
    case "ScreenPrivacy":
      return "/mypage/privacy";
    case "ScreenWithdraw":
      return withDesignVariant("/mypage/withdraw", variant);
    case "ScreenUserProfile":
      return withDesignVariant("/mypage/user/1", variant);
    case "ScreenMyWishlist":
      return "/mypage/wishlist";
    case "ScreenNotifSettings":
      return "/mypage/notification-settings";
    case "ScreenSupport":
      return "/mypage/support";
    case "ScreenInquiry":
      return "/mypage/inquiry";
    case "ScreenAccount":
      return "/mypage/account";
    default:
      return screen.currentRoute || screen.routeProposal || "";
  }
};

export const buildDesignRouteRows = (
  inventoryPath = process.env.YLMC_DESIGN_INVENTORY_PATH ??
    DEFAULT_INVENTORY_PATH,
) => {
  const screens = JSON.parse(readFileSync(inventoryPath, "utf8"));
  const manifestPath =
    process.env.YLMC_ORIGINAL_MANIFEST_PATH ?? DEFAULT_ORIGINAL_MANIFEST_PATH;
  const filenameById = existsSync(manifestPath)
    ? new Map(
        JSON.parse(readFileSync(manifestPath, "utf8")).map((item) => [
          item.id,
          item.filename,
        ]),
      )
    : new Map();

  return screens.map((screen, index) => ({
    index: index + 1,
    section: screen.sectionId ?? screen.section,
    id: screen.id,
    component: screen.component,
    variant: screen.variant ?? "",
    route: routeFor(screen),
    screenshotName:
      filenameById.get(screen.id) ??
      `${String(index + 1).padStart(3, "0")}-${screen.id}.png`,
  }));
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = buildDesignRouteRows();
  const missing = rows.filter((row) => !row.route);

  for (const row of rows) {
    console.log(
      [
        row.index,
        row.section,
        row.id,
        row.component,
        row.variant,
        row.route,
        row.screenshotName,
      ].join("\t"),
    );
  }

  if (missing.length > 0) {
    console.error(`missing routes: ${missing.length}`);
    process.exitCode = 1;
  }
}
