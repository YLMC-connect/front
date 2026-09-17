import type { Member } from "../types/common";
import type { LoginInput } from "../types/auth";

export const MOCK_LOGIN_CREDENTIALS: Readonly<LoginInput> = {
  id: "admin",
  password: "admin",
};

export const MOCK_USER: Member = {
  id: "member-001",
  name: "이민구",
  department: "청년 1부",
  role: "ADMIN",
};

export const MOCK_MEMBERS: Member[] = [
  MOCK_USER,
  {
    id: "member-002",
    name: "박정아",
    department: "장년 2교구",
    role: "USER",
  },
  {
    id: "member-003",
    name: "이수진",
    department: "장년 1교구",
    role: "USER",
  },
  {
    id: "member-004",
    name: "한지수",
    department: "청년 2부",
    role: "MANAGER_COMMUNION",
  },
  {
    id: "member-005",
    name: "정혜진",
    department: "새가족부",
    role: "MANAGER_LIFESTUDY",
  },
  {
    id: "member-006",
    name: "김지영",
    department: "영유아부",
    role: "MANAGER_PRAYER",
  },
];
