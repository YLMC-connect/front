export const queryKeys = {
  home: {
    all: ["home"] as const,
    overview: () => [...queryKeys.home.all, "overview", "http-v6"] as const,
    dawn: () => [...queryKeys.home.all, "dawn", "http-v6"] as const,
  },
  market: {
    all: ["market"] as const,
    overview: () => [...queryKeys.market.all, "overview"] as const,
    categories: () => [...queryKeys.market.all, "categories"] as const,
    mine: (category?: string) =>
      category
        ? ([...queryKeys.market.all, "mine", category] as const)
        : ([...queryKeys.market.all, "mine"] as const),
    detail: (id: string) => [...queryKeys.market.all, "detail", id] as const,
  },
  group: {
    all: ["group"] as const,
    overview: () => [...queryKeys.group.all, "overview"] as const,
    detail: (id: string) => [...queryKeys.group.all, "detail", id] as const,
    members: (id: string) =>
      [...queryKeys.group.detail(id), "members"] as const,
  },
  lifeStudy: {
    all: ["lifeStudy"] as const,
    overview: () =>
      [...queryKeys.lifeStudy.all, "overview", "http-v3"] as const,
    cohortDetail: (cohortId: string) =>
      [...queryKeys.lifeStudy.all, "cohort", cohortId] as const,
    courseLessons: (courseId: string) =>
      [...queryKeys.lifeStudy.all, "courseLessons", courseId] as const,
    lists: () => [...queryKeys.lifeStudy.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.lifeStudy.lists(), filter ?? "all"] as const,
    myCompletions: () => [...queryKeys.lifeStudy.all, "myCompletions"] as const,
  },
  prayer: {
    all: ["prayer"] as const,
    overview: () => [...queryKeys.prayer.all, "overview"] as const,
    cohortStatus: (cohortId: string) =>
      [...queryKeys.prayer.all, "cohort-status", cohortId] as const,
    myApplications: () => [...queryKeys.prayer.all, "my-applications"] as const,
    myHistory: () => [...queryKeys.prayer.all, "my-history"] as const,
    myTopics: () => [...queryKeys.prayer.all, "my-topics"] as const,
    topicBoard: () => [...queryKeys.prayer.all, "topic-board"] as const,
    answers: () => [...queryKeys.prayer.all, "answers"] as const,
    categories: () => [...queryKeys.prayer.all, "categories"] as const,
  },
  member: {
    all: ["member"] as const,
    me: () => [...queryKeys.member.all, "me"] as const,
  },
  mypage: {
    all: ["mypage"] as const,
    activity: () => [...queryKeys.mypage.all, "activity"] as const,
    /** 내 수강 내역. 삶공부 탭 "내 수강"과 마이페이지 수강 내역이 함께 쓴다. */
    lifeStudies: () => [...queryKeys.mypage.all, "life-studies"] as const,
  },
} as const;
