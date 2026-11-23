import { usePrayerOverview } from "../../hooks/usePrayers";
import { StickyHeaderScreen } from "../layout/StickyHeaderScreen";
import { PrayerContent } from "./FaithPrayerContent";
import { PrayerFloatingMenu } from "./FaithParts";
import { styles } from "./faithSectionsStyles";

/** 기도 탭 화면. 삶공부 탭은 `LifeStudyListScreen` 을 쓴다. */
export function FaithSectionsScreen() {
  const prayerQuery = usePrayerOverview();
  const isLastSectionEmpty = (prayerQuery.data?.requests.length ?? 0) === 0;

  return (
    <StickyHeaderScreen
      contentContainerStyle={[
        styles.body,
        isLastSectionEmpty ? styles.bodyWhenLastEmpty : styles.bodyWithFab,
      ]}
      testID="screen-faith"
      title="기도"
      subtitle="함께 기도하고 응답을 나눠요"
      refreshing={prayerQuery.isRefetching}
      onRefresh={() => void prayerQuery.refetch()}
      overlay={<PrayerFloatingMenu />}
    >
      <PrayerContent />
    </StickyHeaderScreen>
  );
}
