import { fireEvent, screen } from "@testing-library/react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { router, usePathname } from "expo-router";
import { AppTabBar } from "../_layout";
import { renderWithClient } from "../../../src/test/renderWithClient";

const rootRoutes = [
  { key: "home", name: "index", title: "홈", testID: "tab-home" },
  { key: "market", name: "market", title: "나눔", testID: "tab-market" },
  { key: "group", name: "group", title: "동행", testID: "tab-group" },
  { key: "prayer", name: "prayer", title: "기도", testID: "tab-prayer" },
  {
    key: "life-study",
    name: "life-study",
    title: "삶공부",
    testID: "tab-life-study",
  },
] as const;

function renderTabBar(index: number, pathname: string) {
  const navigate = jest.fn();
  jest.mocked(usePathname).mockReturnValue(pathname);

  const routes = rootRoutes.map((route) => ({
    key: route.key,
    name: route.name,
  }));
  const descriptors = Object.fromEntries(
    rootRoutes.map((route) => [
      route.key,
      {
        options: {
          title: route.title,
          tabBarButtonTestID: route.testID,
        },
      },
    ]),
  );
  const props = {
    state: { index, routes },
    descriptors,
    navigation: { navigate },
  } as unknown as BottomTabBarProps;

  const view = renderWithClient(<AppTabBar {...props} />);
  return { navigate, unmount: view.unmount };
}

describe("root tab bar", () => {
  it("does not reopen the market, group, prayer, or life-study tab already on screen", () => {
    const cases = [
      { index: 1, pathname: "/market", testID: "tab-market" },
      { index: 2, pathname: "/group", testID: "tab-group" },
      { index: 3, pathname: "/prayer", testID: "tab-prayer" },
      { index: 4, pathname: "/life-study", testID: "tab-life-study" },
    ] as const;

    for (const item of cases) {
      const { navigate, unmount } = renderTabBar(item.index, item.pathname);
      fireEvent.press(screen.getByTestId(item.testID));
      expect(navigate).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("opens a different root tab and navigates to its root page", () => {
    const { navigate } = renderTabBar(1, "/market");

    fireEvent.press(screen.getByTestId("tab-prayer"));

    expect(navigate).toHaveBeenCalledWith("prayer");
    expect(router.replace).toHaveBeenCalledWith("/prayer");
  });
});
