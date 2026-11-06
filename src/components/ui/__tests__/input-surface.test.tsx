import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { AuthInput } from "../../auth/auth-input";
import { Textarea, TextField } from "../inputs";
import { ModalFormTextInput } from "../modal-form-layout";

const flat = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe("InputSurface (TextField · Textarea · ModalFormTextInput · AuthInput)", () => {
  it("draws the same 48 high, radius.sm, 1px borderStrong surface with 16 inset", () => {
    render(
      <>
        <TextField testID="tf" label="이름" />
        <ModalFormTextInput testID="mf" />
        <AuthInput testID="ai" />
      </>,
    );

    for (const id of ["tf", "mf", "ai"]) {
      expect(flat(`${id}-container`)).toMatchObject({
        borderRadius: theme.radius.sm,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
      });
      expect(flat(`${id}-border`)).toMatchObject({
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: theme.radius.sm,
      });
      expect(flat(id)).toMatchObject({
        fontSize: 16,
        color: theme.colors.text,
      });
    }
    expect(flat("tf")).toMatchObject({ height: 48 });
    expect(flat("mf")).toMatchObject({ height: 48 });
    expect(flat("ai-container")).toMatchObject({ height: 48 });
  });

  it("shows a 2px primary ring and an outer 3px primarySubtle halo on focus", () => {
    render(<ModalFormTextInput testID="mf" />);

    expect(screen.queryByTestId("mf-focus-ring")).toBeNull();
    fireEvent(screen.getByTestId("mf"), "focus");
    expect(flat("mf-focus-ring")).toMatchObject({
      borderWidth: 2,
      borderColor: theme.colors.primary,
    });
    expect(flat("mf-focus-halo")).toMatchObject({
      top: -3,
      left: -3,
      right: -3,
      bottom: -3,
      borderWidth: 3,
      borderColor: theme.colors.primarySubtle,
    });

    fireEvent(screen.getByTestId("mf"), "blur");
    expect(screen.queryByTestId("mf-focus-ring")).toBeNull();
    expect(screen.queryByTestId("mf-focus-halo")).toBeNull();
  });

  it("marks errors with a dangerText edge plus an icon and message", () => {
    render(
      <TextField
        testID="tf"
        label="이메일"
        error="이메일 형식을 확인해주세요."
      />,
    );

    expect(flat("tf-border")).toMatchObject({
      borderColor: theme.colors.dangerText,
    });
    expect(screen.getByText("이메일 형식을 확인해주세요.")).toBeTruthy();

    fireEvent(screen.getByTestId("tf"), "focus");
    expect(flat("tf-focus-ring")).toMatchObject({
      borderColor: theme.colors.dangerText,
    });
  });

  it("draws read-only as surfaceSubtle + border + textMuted", () => {
    render(<ModalFormTextInput testID="mf" editable={false} value="홍길동" />);

    expect(flat("mf-container")).toMatchObject({
      backgroundColor: theme.colors.surfaceSubtle,
    });
    expect(flat("mf-border")).toMatchObject({
      borderColor: theme.colors.border,
    });
    expect(flat("mf")).toMatchObject({ color: theme.colors.textMuted });
  });

  it("keeps multi-line inputs at least 132 high", () => {
    render(
      <>
        <Textarea testID="ta" />
        <ModalFormTextInput testID="mf" multiline />
      </>,
    );

    expect(flat("ta")).toMatchObject({ minHeight: 132 });
    expect(flat("mf")).toMatchObject({ minHeight: 132 });
  });

  it("puts 8 between a TextField label and its input", () => {
    render(<TextField testID="tf" label="이름" />);

    const field = screen.getByText("이름").parent?.parent;
    expect(field).toBeTruthy();
    expect(StyleSheet.flatten(field!.props.style)).toMatchObject({ gap: 8 });
  });

  it("sends layout styles to the outer box and text styles to the input", () => {
    render(
      <ModalFormTextInput
        testID="mf"
        style={{ width: 100, marginHorizontal: 0, textAlign: "center" }}
      />,
    );

    expect(flat("mf-field")).toMatchObject({
      width: 100,
      marginHorizontal: 0,
    });
    expect(flat("mf")).toMatchObject({ textAlign: "center" });
    expect(flat("mf")).not.toHaveProperty("width");
  });
});
