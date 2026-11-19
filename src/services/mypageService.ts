import { httpMyPageDataSource as http } from "./mypageHttpDataSource";

export const fetchMyPageActivityPosts = http.getPosts;
export const fetchMyPageActivityComments = http.getComments;
export const fetchMyPageActivityGroups = http.getGroups;
export const fetchMyPageActivityLifeStudies = http.getLifeStudies;
