jest.mock("react-native-worklets", () =>
  require("react-native-worklets/src/mock"),
);
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.useReducedMotion = () => false;
  return Reanimated;
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
    usePathname: jest.fn(() => "/"),
    Stack,
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const MaterialIcons = ({ name }: { name: string }) =>
    React.createElement(Text, null, name);
  MaterialIcons.glyphMap = {};
  const MaterialCommunityIcons = ({ name }: { name: string }) =>
    React.createElement(Text, null, name);
  MaterialCommunityIcons.glyphMap = {};

  return { MaterialCommunityIcons, MaterialIcons };
});

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
