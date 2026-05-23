import {
  MenuList,
  MenuRow,
  PrototypeScreen,
  SectionLabel,
} from "../../../src/components/design/PrototypeScaffold";
import { useLifeStudyCourses } from "../../../src/hooks/useLifeStudyCourses";

export default function LifeStudyHistoryScreen() {
  const { data = [] } = useLifeStudyCourses();
  const history = data.filter(
    (course) => course.isEnrolled || course.isCompleted,
  );

  return (
    <PrototypeScreen title="수강 내역" testID="screen-study-history">
      <SectionLabel>신청/수강 중</SectionLabel>
      <MenuList>
        {history.map((course) => (
          <MenuRow
            key={course.id}
            icon="menu-book"
            title={course.title}
            subtitle={course.schedule}
            value={course.isCompleted ? "수료" : "수강중"}
          />
        ))}
      </MenuList>
      <SectionLabel>지난 수료</SectionLabel>
      <MenuList>
        <MenuRow
          icon="verified"
          title="새가족반"
          subtitle="2025년 하반기"
          value="수료"
        />
      </MenuList>
    </PrototypeScreen>
  );
}
