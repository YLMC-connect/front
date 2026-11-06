import { ApiError } from "./apiClient";

/** 서버 응답에서 버린 부분. 경로·필드 이름만 담고 값·개인정보는 담지 않는다. */
export interface ResponseIssue {
  /** 응답 안의 위치. 예: "prayer.topicBoard.ongoing[2]" */
  source: string;
  /** 무엇이 틀렸는지. 필드 이름까지만. 예: "createdAt 형식 오류" */
  reason: string;
}

/** 지금은 개발 빌드에서 console.warn 만 한다. */
export function reportResponseIssue({ source, reason }: ResponseIssue) {
  if (__DEV__) console.warn(`[응답 형식] ${source}: ${reason}`);
}

/** 응답 형식 오류. field 는 목록에서 항목을 뺄 때 알릴 필드 이름이다. */
export function invalidResponse(data: unknown, field?: string): never {
  const error = new ApiError({
    code: "INVALID_RESPONSE",
    message: "서버 응답 형식을 확인할 수 없습니다.",
    status: 200,
    data,
  });
  throw field ? Object.assign(error, { field }) : error;
}

/** 목록 항목을 하나씩 읽고, 형식이 틀린 항목만 빼고 알린다. */
export function keepValidItems<T>(
  items: readonly unknown[],
  source: string,
  readItem: (item: unknown) => T,
): T[] {
  const result: T[] = [];
  items.forEach((item, index) => {
    try {
      result.push(readItem(item));
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== "INVALID_RESPONSE") {
        throw error;
      }
      const field = (error as { field?: unknown }).field;
      reportResponseIssue({
        source: `${source}[${index}]`,
        reason:
          typeof field === "string" ? `${field} 형식 오류` : "항목 형식 오류",
      });
    }
  });
  return result;
}
