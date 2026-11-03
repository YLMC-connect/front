export const queryKeys = {
  home: {
    all: ["home"] as const,
    overview: () => [...queryKeys.home.all, "overview", "http-v6"] as const,
    dawn: () => [...queryKeys.home.all, "dawn", "http-v6"] as const,
  },
  market: {
    all: ["market"] as const,
    overview: () => [...queryKeys.market.all, "overview"] as const,
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
      [...queryKeys.lifeStudy.all, "overview", "http-v2"] as const,
    cohortDetail: (cohortId: string) =>
      [...queryKeys.lifeStudy.all, "cohort", cohortId] as const,
    lists: () => [...queryKeys.lifeStudy.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.lifeStudy.lists(), filter ?? "all"] as const,
    myCompletions: () => [...queryKeys.lifeStudy.all, "myCompletions"] as const,
  },
  prayer: {
    all: ["prayer"] as const,
    overview: () => [...queryKeys.prayer.all, "overview"] as const,
    detail: (id: string) => [...queryKeys.prayer.all, "detail", id] as const,
  },
  member: {
    all: ["member"] as const,
    me: () => [...queryKeys.member.all, "me"] as const,
  },
  siteContent: {
    all: ["siteContent"] as const,
    terms: (type: string) =>
      [...queryKeys.siteContent.all, "terms", type] as const,
    faqs: (category?: string) =>
      [...queryKeys.siteContent.all, "faqs", category ?? "all"] as const,
  },
} as const;
