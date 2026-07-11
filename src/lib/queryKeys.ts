export const queryKeys = {
  home: {
    all: ["home"] as const,
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
    overview: () => [...queryKeys.lifeStudy.all, "overview"] as const,
    lists: () => [...queryKeys.lifeStudy.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.lifeStudy.lists(), filter ?? "all"] as const,
  },
  prayer: {
    all: ["prayer"] as const,
    overview: () => [...queryKeys.prayer.all, "overview"] as const,
    detail: (id: string) => [...queryKeys.prayer.all, "detail", id] as const,
  },
} as const;
