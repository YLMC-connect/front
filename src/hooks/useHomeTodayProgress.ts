import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HomeTodoId } from "../types/home";

function storageKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `ylmc.home.progress.${y}-${m}-${d}`;
}

async function readDoneIds(date = new Date()): Promise<HomeTodoId[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(date));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is HomeTodoId => id === "dawn-word" || id === "daily-prayer",
    );
  } catch {
    return [];
  }
}

async function writeDoneIds(ids: HomeTodoId[], date = new Date()) {
  await AsyncStorage.setItem(storageKey(date), JSON.stringify(ids));
}

/** Local day-scoped completion for home todos (mock-first). */
export function useHomeTodayProgress(todoIds: readonly HomeTodoId[]) {
  const [doneIds, setDoneIds] = useState<HomeTodoId[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readDoneIds().then((ids) => {
      if (!cancelled) {
        setDoneIds(ids);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const markDone = useCallback(async (id: HomeTodoId) => {
    setDoneIds((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      void writeDoneIds(next);
      return next;
    });
  }, []);

  const isDone = useCallback(
    (id: HomeTodoId) => doneIds.includes(id),
    [doneIds],
  );

  const doneCount = useMemo(
    () => todoIds.filter((id) => doneIds.includes(id)).length,
    [doneIds, todoIds],
  );

  return {
    ready,
    doneCount,
    total: todoIds.length,
    isDone,
    markDone,
  };
}
