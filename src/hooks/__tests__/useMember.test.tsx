import { act } from "@testing-library/react-native";
import { queryKeys } from "../../lib/queryKeys";
import * as authService from "../../services/authService";
import { renderHookWithClient } from "../../test/renderHookWithClient";
import {
  useChangePassword,
  useUpdateMemberMe,
  useVerifyPassword,
  useWithdrawMember,
} from "../useMember";

jest.mock("../../services/authService", () => ({
  changePassword: jest.fn(),
  getCurrentMember: jest.fn(),
  updateCurrentMember: jest.fn(),
  verifyPassword: jest.fn(),
  withdrawMember: jest.fn(),
}));

const service = jest.mocked(authService);
const me = { id: "u1", name: "홍길동", phone: "010-0000-0000" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useUpdateMemberMe", () => {
  it("전화번호를 넘기고 내 정보 캐시를 응답으로 교체한다", async () => {
    const updated = { ...me, phone: "010-1111-2222" };
    service.updateCurrentMember.mockResolvedValue(updated as never);
    const { result, queryClient } = renderHookWithClient(() =>
      useUpdateMemberMe(),
    );
    queryClient.setQueryData(queryKeys.member.me(), me);

    await act(() => result.current.mutateAsync({ phone: "010-1111-2222" }));

    expect(service.updateCurrentMember).toHaveBeenCalledWith({
      phone: "010-1111-2222",
    });
    expect(queryClient.getQueryData(queryKeys.member.me())).toEqual(updated);
  });

  it("실패하면 기존 내 정보 캐시를 유지한다", async () => {
    const error = new Error("400");
    service.updateCurrentMember.mockRejectedValue(error);
    const { result, queryClient } = renderHookWithClient(() =>
      useUpdateMemberMe(),
    );
    queryClient.setQueryData(queryKeys.member.me(), me);

    await act(async () => {
      await expect(
        result.current.mutateAsync({ phone: "010-1111-2222" }),
      ).rejects.toBe(error);
    });

    expect(queryClient.getQueryData(queryKeys.member.me())).toEqual(me);
  });
});

describe("useWithdrawMember", () => {
  it("탈퇴에 성공하면 모든 캐시를 비운다", async () => {
    service.withdrawMember.mockResolvedValue(undefined as never);
    const { result, queryClient } = renderHookWithClient(() =>
      useWithdrawMember(),
    );
    queryClient.setQueryData(queryKeys.member.me(), me);
    queryClient.setQueryData(queryKeys.group.detail("7"), { id: "7" });

    await act(() => result.current.mutateAsync());

    expect(service.withdrawMember).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it("탈퇴에 실패하면 캐시를 남긴다", async () => {
    service.withdrawMember.mockRejectedValue(new Error("500"));
    const { result, queryClient } = renderHookWithClient(() =>
      useWithdrawMember(),
    );
    queryClient.setQueryData(queryKeys.member.me(), me);

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow("500");
    });

    expect(queryClient.getQueryData(queryKeys.member.me())).toEqual(me);
  });
});

describe("password mutations", () => {
  it("비밀번호 확인 입력을 그대로 넘기고 실패를 전달한다", async () => {
    const error = new Error("비밀번호가 일치하지 않습니다.");
    service.verifyPassword.mockRejectedValue(error);
    const { result } = renderHookWithClient(() => useVerifyPassword());
    const input = { password: "pw" } as never;

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toBe(error);
    });

    expect(service.verifyPassword).toHaveBeenCalledWith(input);
  });

  it("비밀번호 변경 입력을 그대로 넘긴다", async () => {
    service.changePassword.mockResolvedValue(undefined as never);
    const { result } = renderHookWithClient(() => useChangePassword());
    const input = { currentPassword: "a", newPassword: "b" } as never;

    await act(() => result.current.mutateAsync(input));

    expect(service.changePassword).toHaveBeenCalledWith(input);
  });
});
