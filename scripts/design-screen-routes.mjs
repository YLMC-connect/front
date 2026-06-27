import { existsSync, readFileSync } from "node:fs";

const DEFAULT_INVENTORY_PATH =
  "/private/tmp/ylmc-golden-screens/2026-05-23/inventory.json";
const DEFAULT_ORIGINAL_MANIFEST_PATH =
  "/private/tmp/ylmc-golden-screens/2026-05-23/original/manifest.json";

const withVariant = (path, variant) =>
  variant ? `${path}?variant=${encodeURIComponent(variant)}` : path;

const routeFor = (screen) => {
  if (screen.component === "ScreenPrayerList") {
    return "/faith";
  }

  if (screen.component === "ScreenStudyList") {
    return "/faith?section=study";
  }

  if (screen.currentRoute || screen.routeProposal) {
    return screen.currentRoute || screen.routeProposal;
  }

  const { component, variant } = screen;

  switch (component) {
    case "ScreenSplash":
      return "/splash";
    case "ScreenLogin":
      return withVariant("/login", variant);
    case "ScreenInviteCode":
      return withVariant("/invite-code", variant);
    case "ScreenTerms":
      return "/terms";
    case "ScreenTermsSheet":
      return "/terms-sheet";
    case "ScreenSignup":
      return withVariant("/signup", variant);
    case "ScreenHome":
      return "/";
    case "ScreenNotifications":
      return "/notifications";
    case "ScreenMarketList":
      return withVariant("/market", variant);
    case "ScreenMarketDetail":
      return withVariant("/market/1", variant);
    case "ScreenMarketCreate":
      return withVariant("/modal/market-new", variant);
    case "ScreenGroupList":
      return withVariant("/group", variant);
    case "ScreenGroupDetail":
      return withVariant("/group/1", variant);
    case "ScreenGroupCreate":
      return withVariant("/modal/group-new", variant);
    case "ScreenGroupNotices":
      return withVariant("/group/notices", variant);
    case "ScreenGroupMembers":
      return withVariant("/group/members", variant);
    case "ScreenPrayerList":
      return "/faith";
    case "ScreenPrayerDetail":
      return "/prayer/1";
    case "ScreenPrayerApply":
      return "/prayer/apply";
    case "ScreenPrayerRequest":
      return "/prayer/request";
    case "ScreenPrayerWrite":
      return "/modal/prayer-new";
    case "ScreenStudyList":
      return "/faith?section=study";
    case "ScreenStudyDetail":
      return "/life-study/1";
    case "ScreenStudyApply":
      return "/life-study/apply";
    case "ScreenStudyHistory":
      return "/life-study/history";
    case "ScreenMyPage":
      return withVariant("/mypage", variant);
    case "ScreenLogoutConfirm":
      return "/mypage?variant=logout-confirm";
    case "ScreenEditProfile":
      return withVariant("/mypage/edit", variant);
    case "ScreenActivity":
      return withVariant("/mypage/activity", variant);
    case "ScreenBlocked":
      return withVariant("/mypage/blocked", variant);
    case "ScreenFAQ":
      return withVariant("/mypage/faq", variant);
    case "ScreenTerms2":
      return "/mypage/terms";
    case "ScreenPrivacy":
      return "/mypage/privacy";
    case "ScreenWithdraw":
      return withVariant("/mypage/withdraw", variant);
    case "ScreenUserProfile":
      return withVariant("/mypage/user/1", variant);
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
