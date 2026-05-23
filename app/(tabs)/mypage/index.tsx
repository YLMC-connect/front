import { useLocalSearchParams } from "expo-router";
import {
  MyPageReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function MyPageScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return <MyPageReferenceScreen variant={variantOf(params.variant)} />;
}
