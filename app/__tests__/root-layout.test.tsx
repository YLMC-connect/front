import { render, screen } from "@testing-library/react-native";
import { AuthRouteNavigator } from "../../src/components/auth/AuthRouteNavigator";
import { useAuthStore } from "../../src/store/authStore";
import type { Member } from "../../src/types/common";

const TEST_USER: Member = {
  id: "member-001",
  name: "김은혜",
  role: "USER",
};

describe("root auth route guard", () => {
  beforeEach(() => {
    useAuthStore.getState().setRestoring();
  });

  it("keeps protected routes unmounted while restoring the session", () => {
    render(<AuthRouteNavigator />);

    expect(screen.getByTestId("auth-restoring")).toBeTruthy();
    expect(screen.queryByTestId("route-(auth)")).toBeNull();
    expect(screen.queryByTestId("route-(tabs)")).toBeNull();
  });

  it.each(["anonymous", "unavailable"] as const)(
    "allows only auth routes for %s state",
    (status) => {
      useAuthStore.setState({
        currentUser: null,
        isLoggedIn: false,
        status,
      });

      render(<AuthRouteNavigator />);

      expect(screen.getByTestId("route-(auth)")).toBeTruthy();
      expect(screen.queryByTestId("route-(tabs)")).toBeNull();
      expect(screen.queryByTestId("route-modal/market-new")).toBeNull();
    },
  );

  it("allows app and modal routes only after authentication", () => {
    useAuthStore.getState().setAuthenticated(TEST_USER);

    render(<AuthRouteNavigator />);

    expect(screen.queryByTestId("route-(auth)")).toBeNull();
    expect(screen.getByTestId("route-(tabs)")).toBeTruthy();
    expect(screen.getByTestId("route-modal/market-new")).toBeTruthy();
    expect(screen.getByTestId("route-modal/group-new")).toBeTruthy();
    expect(screen.getByTestId("route-modal/prayer-new")).toBeTruthy();
  });
});
