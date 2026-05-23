import { useLocalSearchParams } from "expo-router";
import {
  UserProfileReferenceScreen,
  variantOf,
} from "../../../../src/components/prototype/OriginalMockScreens";

export default function MyPageUserProfileScreenRoute() {
  const params = useLocalSearchParams<{ variant?: string }>();
  return <UserProfileReferenceScreen variant={variantOf(params.variant)} />;
}
