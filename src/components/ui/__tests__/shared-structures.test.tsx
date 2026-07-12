import { fireEvent, render, screen } from "@testing-library/react-native";
import {
  DetailAction,
  DetailBadge,
  ModalFormSection,
  SectionDivider,
  UnderlineTabs,
} from "../index";

describe("shared maintenance UI", () => {
  it("keeps detail action press behavior in the shared component", () => {
    const onPress = jest.fn();
    render(
      <DetailAction
        icon="edit"
        label="수정"
        testID="detail-action"
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByTestId("detail-action"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("changes underline tabs only when a different tab is selected", () => {
    const onChange = jest.fn();
    render(
      <UnderlineTabs
        items={[
          { key: "posts", label: "게시글" },
          { key: "comments", label: "댓글" },
        ]}
        active="posts"
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByText("게시글"));
    fireEvent.press(screen.getByText("댓글"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("comments");
  });

  it("renders shared modal form and detail badge variants", () => {
    render(
      <>
        <ModalFormSection label="제목" required hint="1/30">
          <DetailBadge bordered tone="warn">
            확인 필요
          </DetailBadge>
        </ModalFormSection>
        <SectionDivider />
      </>,
    );

    expect(screen.getByText("제목 *")).toBeTruthy();
    expect(screen.getByText("1/30")).toBeTruthy();
    expect(screen.getByText("확인 필요")).toBeTruthy();
  });
});
