import { notifyManager, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { createTestQueryClient } from "./renderWithClient";

// mutation 결과 알림을 act() 안에서 바로 반영해 act 경고를 막는다.
notifyManager.setScheduler((callback) => callback());

/**
 * 테스트용 QueryClient 로 hook 을 렌더링한다.
 * 캐시 시드·무효화 검증을 위해 queryClient 를 함께 돌려준다.
 */
export function renderHookWithClient<Result>(hook: () => Result) {
  const queryClient = createTestQueryClient();
  const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

  const rendered = renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

  /** invalidateQueries 로 넘어간 queryKey 목록 */
  const invalidatedKeys = () =>
    invalidateSpy.mock.calls.map(([filters]) => filters?.queryKey);

  return { ...rendered, queryClient, invalidatedKeys };
}
