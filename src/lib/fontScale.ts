import { useCallback } from "react";
import { useWindowDimensions } from "react-native";

/**
 * 글자 크기 설정이 기본보다 크면 고정 높이를 그 비율만큼 키운다.
 * 기본(1) 이하에서는 그대로 둔다. 머리글·상단 고정 영역처럼 높이가 스크롤 계산에
 * 쓰이는 곳은 모두 이 함수를 거쳐야 위치 계산이 서로 어긋나지 않는다.
 */
export function scaleHeightForFont(height: number, fontScale: number) {
  return Math.round(height * Math.max(1, fontScale));
}

/** 현재 글자 크기 설정으로 고정 높이를 키우는 함수를 돌려준다. */
export function useScaleHeightForFont() {
  const { fontScale } = useWindowDimensions();
  return useCallback(
    (height: number) => scaleHeightForFont(height, fontScale),
    [fontScale],
  );
}
