import {
  mockLifeStudyCourses,
  mockLifeStudyOverview,
} from "../mocks/lifeStudy";
import type {
  LifeStudyCourse,
  LifeStudyOverview,
  LifeStudyStatus,
} from "../types/lifeStudy";

const courses: LifeStudyCourse[] = [...mockLifeStudyCourses];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchLifeStudyOverview(): Promise<LifeStudyOverview> {
  await delay();
  return mockLifeStudyOverview;
}

export async function fetchLifeStudyCourses(
  filter: LifeStudyStatus = "all",
): Promise<LifeStudyCourse[]> {
  await delay();
  if (filter === "all") return courses;
  return courses.filter((course) => course.status === filter);
}
