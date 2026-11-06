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
    // 의도된 무시: 기기에 저장된 오늘 진행 기록이 깨졌으면 미완료로 시작한다.
    return [];
  }
}

async function writeDoneIds(ids: HomeTodoId[], date = new Date()) {
  await AsyncStorage.setItem(storageKey(date), JSON.stringify(ids));
}

export async function cleanupOldProgressKeys(
  currentDate = new Date(),
  maxDays = 7,
) {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const progressKeys = allKeys.filter((k) =>
      k.startsWith("ylmc.home.progress."),
    );
    const currentMs = currentDate.getTime();
    const thresholdMs = maxDays * 24 * 60 * 60 * 1000;

    const keysToRemove = progressKeys.filter((key) => {
      const dateStr = key.replace("ylmc.home.progress.", "");
      const keyDate = new Date(dateStr);
      if (Number.isNaN(keyDate.getTime())) return true;
      return currentMs - keyDate.getTime() > thresholdMs;
    });

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch {
    // 의도된 무시: 지난 진행 기록 정리는 다음 실행 때 다시 시도하면 된다.
  }
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
    void cleanupOldProgressKeys();
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
