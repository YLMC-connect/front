process.env.EXPO_PUBLIC_AUTH_ADAPTER = "mock";
process.env.EXPO_PUBLIC_MARKET_ADAPTER = "mock";
process.env.EXPO_PUBLIC_GROUP_ADAPTER = "mock";

jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock"),
);

jest.mock("expo-font", () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
});

jest.mock("lottie-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const LottieView = React.forwardRef(
    (props: Record<string, unknown>, _ref: unknown) =>
      React.createElement(View, { testID: "lottie-mock", ...props }),
  );
  LottieView.displayName = "LottieView";
  return LottieView;
});

jest.mock("expo-router", () => {
  const React = require("react");
  const { View } = require("react-native");

  const Stack = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  Stack.Screen = ({ name }: { name: string }) =>
    React.createElement(View, { testID: `route-${name}` });
  Stack.Protected = ({
    children,
    guard,
  }: {
    children: React.ReactNode;
    guard: boolean;
  }) => (guard ? React.createElement(React.Fragment, null, children) : null);

  return {
    Link: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    router: {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    },
    useRouter: jest.fn(() => ({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    useNavigation: jest.fn(() => ({
      addListener: () => () => undefined,
      isFocused: () => true,
    })),
    usePathname: jest.fn(() => "/"),
    Stack,
  };
});

jest.mock(
  "@solar-icons/react-native/Linear",
  () => {
    const React = require("react");
    const { View } = require("react-native");

    return new Proxy(
      { __esModule: true },
      {
        get: (target, property) =>
          property in target
            ? target[property as keyof typeof target]
            : (props: Record<string, unknown>) =>
                React.createElement(View, props),
      },
    );
  },
  { virtual: true },
);

jest.mock(
  "@solar-icons/react-native/Bold",
  () => {
    const React = require("react");
    const { View } = require("react-native");

    return new Proxy(
      { __esModule: true },
      {
        get: (target, property) =>
          property in target
            ? target[property as keyof typeof target]
            : (props: Record<string, unknown>) =>
                React.createElement(View, props),
      },
    );
  },
  { virtual: true },
);

jest.mock("expo-image", () => {
  const { Image } = require("react-native");

  return { Image };
});

jest.mock("expo-blur", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    BlurView: (props: Record<string, unknown>) =>
      React.createElement(View, props),
    BlurTargetView: React.forwardRef(
      (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
        React.createElement(View, { ...props, ref }),
    ),
  };
});

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    LinearGradient: (props: Record<string, unknown>) =>
      React.createElement(View, props),
  };
});

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: {
    Images: "Images",
  },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));
