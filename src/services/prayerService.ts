import { httpPrayerDataSource as http } from "./prayerHttpDataSource";

export const fetchPrayerOverview = http.getOverview;
export const fetchPrayerCohortStatus = http.getCohortStatus;
export const completePrayerCohort = http.completeCohort;
export const cancelPrayerCohortCompletion = http.cancelCohortCompletion;
export const createPrayerApplication = http.createApplication;
export const cancelPrayerApplication = http.cancelApplication;
export const fetchMyPrayerHistory = http.getMyHistory;
export const fetchPrayerCategories = http.getCategories;
export const fetchPrayerTopicBoard = http.getTopicBoard;
export const fetchMyPrayerTopics = http.getMyTopics;
export const fetchPrayerAnswerPage = http.getAnswerPage;
export const createPrayerTopicRequest = http.createTopic;
export const requestPrayerTopicAnswer = http.requestTopicAnswer;
