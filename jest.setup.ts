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

  return {
    Link: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    router: {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    },
    useRouter: jest.fn(() => ({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => "/"),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const MaterialIcons = ({ name }: { name: string }) =>
    React.createElement(Text, null, name);
  MaterialIcons.glyphMap = {};

  return { MaterialIcons };
});

jest.mock("expo-image", () => {
  const { Image } = require("react-native");

  return { Image };
});

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: {
    Images: "Images",
  },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));
