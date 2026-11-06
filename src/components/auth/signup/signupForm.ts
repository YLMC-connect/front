import { isValidLoginId } from "../../../lib/authValidation";

export type FormValues = {
  id: string;
  password: string;
  passwordConfirm: string;
  userName: string;
  phone: string;
  email: string;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export type Availability = {
  value: string;
  available: boolean;
};

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Korean mobile display: digits only → 010-XXXX-XXXX (max 11 digits). */
export function formatPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function validateSignup(values: FormValues) {
  const errors: FormErrors = {};
  if (values.id.trim().length < 3) {
    errors.id = "아이디는 3자 이상 입력해주세요.";
  } else if (!isValidLoginId(values.id.trim())) {
    errors.id = "영문 소문자와 숫자만 입력할 수 있어요.";
  }
  if (values.password.length < 8) {
    errors.password = "비밀번호는 8자 이상 입력해주세요.";
  }
  if (values.userName.trim().length < 2) {
    errors.userName = "이름을 2자 이상 입력해주세요.";
  } else if (!/^[가-힣]+$/.test(values.userName.trim())) {
    errors.userName = "이름은 한글만 입력할 수 있어요.";
  }
  if (phoneDigits(values.phone).length < 10) {
    errors.phone = "연락처를 입력해주세요.";
  }
  if (!emailPattern.test(values.email)) {
    errors.email = "이메일을 입력해주세요.";
  }
  return errors;
}
