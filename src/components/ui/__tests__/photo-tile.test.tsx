import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { PhotoTile } from "../photo-tile";

describe("PhotoTile", () => {
  it("renders the add tile with a dashed border and 추가 label", () => {
    const onPress = jest.fn();
    render(<PhotoTile variant="add" onPress={onPress} testID="add" />);

    expect(screen.getByText("추가")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("add").props.style),
    ).toMatchObject({
      width: 80,
      height: 80,
      borderRadius: theme.radius.sm,
      borderStyle: "dashed",
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceSubtle,
    });

    fireEvent.press(screen.getByLabelText("사진 추가"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows the cover band and a 44pt remove button named by photo number", () => {
    const onRemove = jest.fn();
    render(
      <PhotoTile
        variant="photo"
        uri="file:///a.jpg"
        index={0}
        cover
        onRemove={onRemove}
        testID="tile"
      />,
    );

    expect(screen.getByText("대표")).toBeTruthy();
    const remove = screen.getByLabelText("사진 1 삭제");
    expect(StyleSheet.flatten(remove.props.style)).toMatchObject({
      width: 44,
      height: 44,
    });
    fireEvent.press(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("hides the remove button and cover band when not asked", () => {
    render(<PhotoTile variant="photo" uri="file:///a.jpg" index={1} />);

    expect(screen.queryByLabelText("사진 2 삭제")).toBeNull();
    expect(screen.queryByText("대표")).toBeNull();
  });

  it("shows upload progress from props", () => {
    render(
      <PhotoTile
        variant="uploading"
        uri="file:///a.jpg"
        index={2}
        progress={60}
      />,
    );

    expect(screen.getByText("60%")).toBeTruthy();
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar.props.accessibilityLabel).toBe("사진 3 올리는 중");
    expect(progressBar.props.accessibilityValue).toMatchObject({
      min: 0,
      max: 100,
      now: 60,
    });
  });

  it("shows a retry tile on failure", () => {
    const onRetry = jest.fn();
    render(
      <PhotoTile
        variant="failed"
        uri="file:///a.jpg"
        index={0}
        cover
        onRetry={onRetry}
      />,
    );

    expect(screen.queryByText("대표")).toBeNull();
    const retry = screen.getByLabelText("사진 1 다시 시도");
    expect(StyleSheet.flatten(retry.props.style)).toMatchObject({
      backgroundColor: theme.colors.dangerText,
    });
    fireEvent.press(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
