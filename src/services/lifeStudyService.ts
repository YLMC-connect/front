import { mockLifeStudyCourses, mockLifeStudyHistory } from "../mocks/lifeStudy";
import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyStatus,
} from "../types/lifeStudy";

let courses: LifeStudyCourse[] = [...mockLifeStudyCourses];
let history: LifeStudyHistory[] = [...mockLifeStudyHistory];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchLifeStudyCourses(
  filter: LifeStudyStatus = "all",
): Promise<LifeStudyCourse[]> {
  await delay();
  if (filter === "all") return courses;
  return courses.filter((course) => course.status === filter);
}

export async function fetchLifeStudyCourse(
  id: string,
): Promise<LifeStudyCourse> {
  await delay();
  const course = courses.find((candidate) => candidate.id === id);
  if (!course) throw new Error("존재하지 않는 삶공부 과정입니다.");
  return course;
}

export async function fetchLifeStudyHistory(): Promise<LifeStudyHistory[]> {
  await delay();
  return history;
}

export async function enrollLifeStudyCourse(
  id: string,
): Promise<LifeStudyCourse> {
  await delay();
  const course = await fetchLifeStudyCourse(id);

  if (course.status === "completed") {
    throw new Error("완료된 과정은 신청할 수 없습니다.");
  }

  if (course.enrolledCount >= course.capacity) {
    throw new Error("정원이 마감된 과정입니다.");
  }

  courses = courses.map((candidate) =>
    candidate.id === id
      ? {
          ...candidate,
          isEnrolled: true,
          enrolledCount: candidate.isEnrolled
            ? candidate.enrolledCount
            : candidate.enrolledCount + 1,
        }
      : candidate,
  );

  return fetchLifeStudyCourse(id);
}

export async function cancelLifeStudyEnrollment(
  id: string,
): Promise<LifeStudyCourse> {
  await delay();
  courses = courses.map((course) =>
    course.id === id && course.isEnrolled
      ? {
          ...course,
          isEnrolled: false,
          enrolledCount: Math.max(0, course.enrolledCount - 1),
        }
      : course,
  );
  history = history.filter(
    (entry) => entry.courseId !== id || entry.completedAt,
  );
  return fetchLifeStudyCourse(id);
}
