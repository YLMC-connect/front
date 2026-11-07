import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { appFont } from "../../../constants/fonts";
import { Text, TextInput } from "../text";

const flat = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe("Text · TextInput (Pretendard)", () => {
  it("picks the Pretendard file for the weight and resets fontWeight", () => {
    render(
      <>
        <Text testID="regular">본문</Text>
        <Text testID="bold" style={{ fontWeight: "700" }}>
          제목
        </Text>
        <TextInput testID="input" style={{ fontWeight: "500" }} />
      </>,
    );

    expect(flat("regular")).toMatchObject({
      fontFamily: appFont.regular,
      fontWeight: "normal",
    });
    expect(flat("bold")).toMatchObject({
      fontFamily: appFont.bold,
      fontWeight: "normal",
    });
    expect(flat("input")).toMatchObject({ fontFamily: appFont.medium });
  });

  it("keeps a fontFamily the caller set", () => {
    render(
      <Text testID="custom" style={{ fontFamily: appFont.semibold }}>
        버튼
      </Text>,
    );

    expect(flat("custom").fontFamily).toBe(appFont.semibold);
  });
});
