import { useNavigation } from "expo-router";
import { useEffect, useRef } from "react";

type TabPressEvent = { defaultPrevented?: boolean };

type NavigationLike = {
  getState(): { type?: string } | undefined;
  getParent(): NavigationLike | undefined;
  isFocused(): boolean;
  addListener(
    type: "tabPress",
    callback: (event: TabPressEvent) => void,
  ): () => void;
};

/**
 * 이미 보고 있는 탭을 다시 눌렀을 때 `onReselect` 를 부른다(필터·세그먼트를 기본값으로 되돌리는 용도).
 * React Navigation `useScrollToTop` 과 같은 방식으로 위쪽 탭 네비게이터의 `tabPress` 를 듣는다.
 * 이 화면이 보이고 있을 때만 부른다. 상세 화면에 있을 때 누르면 탭 스택이 목록으로 돌아가고, 한 번 더 누르면 초기화된다.
 */
export function useTabReselect(onReselect: () => void) {
  const navigation = useNavigation() as unknown as NavigationLike;
  const callbackRef = useRef(onReselect);

  useEffect(() => {
    callbackRef.current = onReselect;
  }, [onReselect]);

  useEffect(() => {
    const tabNavigations: NavigationLike[] = [];
    let current: NavigationLike | undefined = navigation;
    while (current) {
      if (current.getState()?.type === "tab") tabNavigations.push(current);
      current = current.getParent();
    }

    const unsubscribers = tabNavigations.map((tab) =>
      tab.addListener("tabPress", (event) => {
        const isFocused = navigation.isFocused();
        // 다른 리스너가 preventDefault 했는지 알 수 있게 다음 프레임에 판단한다
        requestAnimationFrame(() => {
          if (isFocused && !event.defaultPrevented) callbackRef.current();
        });
      }),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [navigation]);
}
