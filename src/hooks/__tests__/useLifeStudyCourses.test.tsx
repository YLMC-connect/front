import { act } from "@testing-library/react-native";
import { queryKeys } from "../../lib/queryKeys";
import * as lifeStudyService from "../../services/lifeStudyService";
import { renderHookWithClient } from "../../test/renderHookWithClient";
import { useApplyLifeStudyCohort } from "../useLifeStudyCourses";

jest.mock("../../services/lifeStudyService", () => ({
  applyLifeStudyCohort: jest.fn(),
  fetchLifeStudyCohortDetail: jest.fn(),
  fetchLifeStudyCourses: jest.fn(),
  fetchLifeStudyOverview: jest.fn(),
}));

const service = jest.mocked(lifeStudyService);
const input = { attendType: "OFFLINE" } as never;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useApplyLifeStudyCohort", () => {
  it("기수 id 와 입력을 넘기고 삶공부 전체를 무효화한다", async () => {
    service.applyLifeStudyCohort.mockResolvedValue(undefined as never);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useApplyLifeStudyCohort(),
    );

    await act(() => result.current.mutateAsync({ cohortId: 12, input }));

    expect(service.applyLifeStudyCohort).toHaveBeenCalledWith(12, input);
    expect(invalidatedKeys()).toEqual([queryKeys.lifeStudy.all]);
  });

  it("실패하면 에러를 전달하고 캐시를 무효화하지 않는다", async () => {
    const error = new Error("정원이 가득 찼습니다.");
    service.applyLifeStudyCohort.mockRejectedValue(error);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useApplyLifeStudyCohort(),
    );
    queryClient.setQueryData(queryKeys.lifeStudy.cohortDetail("12"), {
      id: "12",
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ cohortId: "12", input }),
      ).rejects.toBe(error);
    });

    expect(result.current.error).toBe(error);
    expect(invalidatedKeys()).toEqual([]);
    expect(
      queryClient.getQueryState(queryKeys.lifeStudy.cohortDetail("12"))
        ?.isInvalidated,
    ).toBe(false);
  });
});
