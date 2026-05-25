import { router, useLocalSearchParams } from "expo-router";
import {
  PrayerListReferenceScreen,
  StudyListReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

type FaithSection = "pray" | "study";

export default function FaithScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const section: FaithSection =
    variantOf(params.section, "pray") === "study" ? "study" : "pray";

  const changeSection = (next: FaithSection) => {
    router.replace(next === "study" ? "/faith?section=study" : "/faith");
  };

  if (section === "study") {
    return (
      <StudyListReferenceScreen
        testID="screen-faith"
        onSectionChange={changeSection}
      />
    );
  }

  return (
    <PrayerListReferenceScreen
      testID="screen-faith"
      onSectionChange={changeSection}
    />
  );
}
