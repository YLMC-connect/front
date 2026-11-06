import { useLifeStudyOverview } from "../../hooks/useLifeStudyCourses";
import { usePrayerOverview } from "../../hooks/usePrayers";
import { StickyHeaderScreen } from "../layout/StickyHeaderScreen";
import { PrayerContent } from "./FaithPrayerContent";
import { StudyContent } from "./FaithStudyContent";
import { PrayerFloatingMenu } from "./FaithParts";
import { styles } from "./faithSectionsStyles";

type FaithSection = "pray" | "study";

export function FaithSectionsScreen({ section }: { section: FaithSection }) {
  const prayerQuery = usePrayerOverview();
  const studyQuery = useLifeStudyOverview();
  const currentQuery = section === "study" ? studyQuery : prayerQuery;

  const isLastSectionEmpty =
    section === "study"
      ? (studyQuery.data?.courses.length ?? 0) === 0
      : (prayerQuery.data?.requests.length ?? 0) === 0;

  return (
    <StickyHeaderScreen
      contentContainerStyle={[
        styles.body,
        isLastSectionEmpty
          ? styles.bodyWhenLastEmpty
          : section === "pray"
            ? styles.bodyWithFab
            : styles.bodyWithTab,
      ]}
      testID="screen-faith"
      title={section === "study" ? "삶공부" : "기도"}
      subtitle={
        section === "study"
          ? "말씀으로 배우고 삶으로 자라가요"
          : "함께 기도하고 응답을 나눠요"
      }
      refreshing={currentQuery.isRefetching}
      onRefresh={() => void currentQuery.refetch()}
      overlay={section === "pray" ? <PrayerFloatingMenu /> : undefined}
    >
      {section === "study" ? <StudyContent /> : <PrayerContent />}
    </StickyHeaderScreen>
  );
}
