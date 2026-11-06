import { act } from "@testing-library/react-native";
import { queryKeys } from "../../lib/queryKeys";
import * as prayerService from "../../services/prayerService";
import { renderHookWithClient } from "../../test/renderHookWithClient";
import {
  useCreatePrayerApplication,
  useCreatePrayerTopicApi,
  useRequestPrayerTopicAnswer,
  useTogglePrayerCompletion,
} from "../usePrayers";

jest.mock("../../services/prayerService", () => ({
  cancelPrayerCohortCompletion: jest.fn(),
  completePrayerCohort: jest.fn(),
  createPrayerApplication: jest.fn(),
  createPrayerTopicRequest: jest.fn(),
  fetchPrayerCategories: jest.fn(),
  fetchPrayerOverview: jest.fn(),
  requestPrayerTopicAnswer: jest.fn(),
}));

const service = jest.mocked(prayerService);
const statusKey = ["prayer", "cohort-status", "3"];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useTogglePrayerCompletion", () => {
  it("완료 전이면 완료 API 를 부르고 상태 캐시·기도·홈을 갱신한다", async () => {
    const status = { completed: true };
    service.completePrayerCohort.mockResolvedValue(status as never);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useTogglePrayerCompletion("3"),
    );

    await act(() => result.current.mutateAsync(false));

    expect(service.completePrayerCohort).toHaveBeenCalledWith("3");
    expect(service.cancelPrayerCohortCompletion).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(statusKey)).toEqual(status);
    expect(invalidatedKeys()).toEqual([
      queryKeys.prayer.all,
      queryKeys.home.all,
    ]);
  });

  it("이미 완료했으면 완료 취소 API 를 부른다", async () => {
    const status = { completed: false };
    service.cancelPrayerCohortCompletion.mockResolvedValue(status as never);
    const { result, queryClient } = renderHookWithClient(() =>
      useTogglePrayerCompletion("3"),
    );

    await act(() => result.current.mutateAsync(true));

    expect(service.cancelPrayerCohortCompletion).toHaveBeenCalledWith("3");
    expect(service.completePrayerCohort).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(statusKey)).toEqual(status);
  });

  it("실패하면 기존 상태 캐시를 유지하고 무효화하지 않는다", async () => {
    const error = new Error("500");
    service.completePrayerCohort.mockRejectedValue(error);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useTogglePrayerCompletion("3"),
    );
    queryClient.setQueryData(statusKey, { completed: false });

    await act(async () => {
      await expect(result.current.mutateAsync(false)).rejects.toBe(error);
    });

    expect(queryClient.getQueryData(statusKey)).toEqual({ completed: false });
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useCreatePrayerApplication", () => {
  it("신청 입력을 넘기고 내 신청·기도 전체를 무효화한다", async () => {
    service.createPrayerApplication.mockResolvedValue(undefined as never);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useCreatePrayerApplication(),
    );
    const input = { cohortId: 3 } as never;

    await act(() => result.current.mutateAsync(input));

    expect(service.createPrayerApplication).toHaveBeenCalledWith(input);
    expect(invalidatedKeys()).toEqual([
      ["prayer", "my-applications"],
      queryKeys.prayer.all,
    ]);
  });

  it("실패하면 에러를 전달하고 무효화하지 않는다", async () => {
    const error = new Error("이미 신청한 기도방입니다.");
    service.createPrayerApplication.mockRejectedValue(error);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useCreatePrayerApplication(),
    );

    await act(async () => {
      await expect(result.current.mutateAsync({} as never)).rejects.toBe(error);
    });

    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useCreatePrayerTopicApi", () => {
  it("작성 후 내 기도제목·게시판·기도 전체를 무효화한다", async () => {
    service.createPrayerTopicRequest.mockResolvedValue(undefined as never);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useCreatePrayerTopicApi(),
    );
    const input = { title: "기도", content: "내용" } as never;

    await act(() => result.current.mutateAsync(input));

    expect(service.createPrayerTopicRequest).toHaveBeenCalledWith(input);
    expect(invalidatedKeys()).toEqual([
      ["prayer", "my-topics"],
      ["prayer", "topic-board"],
      queryKeys.prayer.all,
    ]);
  });

  it("실패하면 무효화하지 않는다", async () => {
    service.createPrayerTopicRequest.mockRejectedValue(new Error("400"));
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useCreatePrayerTopicApi(),
    );

    await act(async () => {
      await expect(result.current.mutateAsync({} as never)).rejects.toThrow(
        "400",
      );
    });

    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useRequestPrayerTopicAnswer", () => {
  it("topicId 와 입력을 나눠 넘기고 기도제목 목록을 무효화한다", async () => {
    service.requestPrayerTopicAnswer.mockResolvedValue(undefined as never);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useRequestPrayerTopicAnswer(),
    );
    const input = { answerContent: "응답" } as never;

    await act(() => result.current.mutateAsync({ topicId: "t1", input }));

    expect(service.requestPrayerTopicAnswer).toHaveBeenCalledWith("t1", input);
    expect(invalidatedKeys()).toEqual([
      ["prayer", "my-topics"],
      ["prayer", "topic-board"],
      queryKeys.prayer.all,
    ]);
  });
});
