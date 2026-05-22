import { render, screen } from "@testing-library/react-native";
import { EmptyState } from "../index";

describe("EmptyState", () => {
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
});
