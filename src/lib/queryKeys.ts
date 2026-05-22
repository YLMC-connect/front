export const queryKeys = {
  home: {
    all: ["home"] as const,
  },
  market: {
    all: ["market"] as const,
    lists: () => [...queryKeys.market.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.market.lists(), filter ?? "all"] as const,
    detail: (id: string) => [...queryKeys.market.all, "detail", id] as const,
  },
  group: {
    all: ["group"] as const,
    lists: () => [...queryKeys.group.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.group.lists(), filter ?? "all"] as const,
    detail: (id: string) => [...queryKeys.group.all, "detail", id] as const,
  },
  lifeStudy: {
    all: ["lifeStudy"] as const,
    lists: () => [...queryKeys.lifeStudy.all, "list"] as const,
    list: (filter?: unknown) =>
      [...queryKeys.lifeStudy.lists(), filter ?? "all"] as const,
    detail: (id: string) => [...queryKeys.lifeStudy.all, "detail", id] as const,
    history: () => [...queryKeys.lifeStudy.all, "history"] as const,
  },
  prayer: {
    all: ["prayer"] as const,
    lists: () => [...queryKeys.prayer.all, "list"] as const,
    detail: (id: string) => [...queryKeys.prayer.all, "detail", id] as const,
  },
  mypage: {
    all: ["mypage"] as const,
  },
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
} as const;
