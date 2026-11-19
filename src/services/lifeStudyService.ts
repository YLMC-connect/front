import { httpLifeStudyDataSource as http } from "./lifeStudyHttpDataSource";

export const fetchLifeStudyOverview = http.getOverview;
export const fetchLifeStudyCourses = http.getCourses;
export const fetchMyLifeStudyCompletions = http.getMyCompletions;
export const fetchLifeStudyCohortDetail = http.getCohortDetail;
export const fetchLifeStudyCourseLessons = http.getCourseLessons;
export const applyLifeStudyCohort = http.applyCohort;
