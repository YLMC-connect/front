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
jest.mock("@react-native-community/netinfo", () =>
  require("@react-native-community/netinfo/jest/netinfo-mock.js"),
);
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
});

jest.mock(
  "lottie-react-native",
  () => {
    const React = require("react");
    const { View } = require("react-native");
    const LottieView = React.forwardRef(
      (props: Record<string, unknown>, _ref: unknown) =>
        React.createElement(View, { testID: "lottie-mock", ...props }),
    );
    LottieView.displayName = "LottieView";
    return LottieView;
  },
  { virtual: true },
);

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
  "lucide-react-native",
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
                React.createElement(View, {
                  testID: `lucide-icon-${String(property)}`,
                  ...props,
                }),
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
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

// RN jest 프리셋은 글자 크기 설정(fontScale)을 2 로 두지만, 실제 기본값은 1 이다.
// 글자 크기에 따라 높이를 키우는 화면(Issue 258)이 기본 크기로 그려지도록 1 로 맞춘다.
// 큰 글자 테스트는 파일 안에서 이 모듈을 다시 mock 한다.
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => {
  const actual = jest.requireActual(
    "react-native/Libraries/Utilities/useWindowDimensions",
  );
  const useWindowDimensions = actual.default ?? actual;
  return {
    __esModule: true,
    default: () => ({ ...useWindowDimensions(), fontScale: 1 }),
  };
});
