export const queryKeys = {
  home: {
    all: ["home"] as const,
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
