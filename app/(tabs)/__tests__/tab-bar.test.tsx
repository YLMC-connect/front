import { fireEvent, screen } from "@testing-library/react-native";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { usePathname } from "expo-router";
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
  const emit = jest.fn(() => ({ defaultPrevented: false }));
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
    navigation: { navigate, emit },
  } as unknown as BottomTabBarProps;

  const view = renderWithClient(<AppTabBar {...props} />);
  return { navigate, emit, unmount: view.unmount };
}

describe("root tab bar", () => {
  it("sends tabPress (scroll to top) but does not reopen a tab already on screen", () => {
    const cases = [
      { index: 1, pathname: "/market", testID: "tab-market" },
      { index: 2, pathname: "/group", testID: "tab-group" },
      { index: 3, pathname: "/prayer", testID: "tab-prayer" },
      { index: 4, pathname: "/life-study", testID: "tab-life-study" },
    ] as const;

    for (const item of cases) {
      const { navigate, emit, unmount } = renderTabBar(
        item.index,
        item.pathname,
      );
      fireEvent.press(screen.getByTestId(item.testID));
      expect(emit).toHaveBeenCalledWith(
        expect.objectContaining({ type: "tabPress" }),
      );
      expect(navigate).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("opens a different root tab keeping its previous state", () => {
    const { navigate, unmount } = renderTabBar(1, "/market");

    fireEvent.press(screen.getByTestId("tab-prayer"));

    expect(navigate).toHaveBeenCalledWith("prayer", undefined);
    unmount();
  });

  it("keeps the tab bar mounted while a root modal is presented over a root tab", () => {
    jest.mocked(usePathname).mockReturnValue("/group");
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
      state: { index: 2, routes },
      descriptors,
      navigation: { navigate: jest.fn() },
    } as unknown as BottomTabBarProps;

    const view = renderWithClient(<AppTabBar {...props} />);
    expect(screen.getByTestId("tab-bar-shell")).toBeTruthy();

    jest.mocked(usePathname).mockReturnValue("/modal/group-new");
    view.rerender(<AppTabBar {...props} />);
    expect(screen.getByTestId("tab-bar-shell")).toBeTruthy();
    view.unmount();
  });
});
