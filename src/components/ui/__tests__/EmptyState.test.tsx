import { fireEvent, render, screen } from "@testing-library/react-native";
import { Empty, EmptyState, SuccessState } from "../index";

describe("Empty / EmptyState", () => {
  it("renders the empty component with title, description, and testID", () => {
    render(
      <Empty
        title="참여 중인 기도방이 없어요"
        description="중보기도 신청을 통해 기도방에 참여해보세요."
        testID="custom-empty"
      />,
    );

    expect(screen.getByTestId("custom-empty")).toBeTruthy();
    expect(screen.getByText("참여 중인 기도방이 없어요")).toBeTruthy();
    expect(
      screen.getByText("중보기도 신청을 통해 기도방에 참여해보세요."),
    ).toBeTruthy();
  });
  it("renders the empty title and description", () => {
    render(
      <EmptyState
        title="표시할 항목이 없습니다"
        description="mock 데이터가 없을 때 보여줍니다."
      />,
    );

    expect(screen.getByText("표시할 항목이 없습니다")).toBeTruthy();
    expect(screen.getByText("mock 데이터가 없을 때 보여줍니다.")).toBeTruthy();
  });

  it("runs the contextual empty-state action", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        title="나눔이 없습니다"
        actionLabel="나눔 등록하기"
        onAction={onAction}
      />,
    );

    fireEvent.press(screen.getByText("나눔 등록하기"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders a reusable success state", () => {
    render(
      <SuccessState
        title="등록되었습니다"
        description="목록에서 확인할 수 있어요."
      />,
    );

    expect(screen.getByText("등록되었습니다")).toBeTruthy();
    expect(screen.getByText("목록에서 확인할 수 있어요.")).toBeTruthy();
  });
});
