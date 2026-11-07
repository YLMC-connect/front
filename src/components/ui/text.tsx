import type { Ref } from "react";
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextProps,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { fontFamilyForWeight } from "../../constants/fonts";

/**
 * 굵기(fontWeight)에 맞는 Pretendard 파일을 고른다. RN 은 글꼴 하나로 굵기를 만들지 못해
 * 굵기마다 다른 글꼴 이름을 쓰고 fontWeight 는 normal 로 둔다. fontFamily 를 직접 주면 그대로 둔다.
 */
function withAppFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style);
  if (flat?.fontFamily) return style;
  return [
    style,
    { fontFamily: fontFamilyForWeight(flat?.fontWeight), fontWeight: "normal" },
  ];
}

/** react-native Text 와 같고, 글꼴만 Pretendard 로 맞춘다. */
export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={withAppFont(style)} />;
}

/** react-native TextInput 과 같고, 글꼴만 Pretendard 로 맞춘다. */
export function TextInput({
  style,
  ...props
}: TextInputProps & { ref?: Ref<RNTextInput> }) {
  return <RNTextInput {...props} style={withAppFont(style)} />;
}

/** ref 타입은 react-native TextInput 그대로(useRef<TextInput>). */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- 값(컴포넌트)과 같은 이름의 ref 타입
export type TextInput = RNTextInput;
