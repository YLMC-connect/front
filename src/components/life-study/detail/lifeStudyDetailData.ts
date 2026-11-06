import type { LifeStudyOverviewStatus } from "../../../types/lifeStudy";

export const course = {
  name: "생명의 삶",
  leader: "박귀원",
  desc: "구원의 확신이 있는지, 지금 죽는다 해도 천국에 갈 수 있는지, 신앙의 근본을 바로 잡도록 돕는 가장 기본적인 삶공부입니다.",
  target: "등록교인 누구나",
  requirement: "등록교인 누구나 신청할 수 있어요",
  next: "생명언어의 삶 → 새로운 삶",
};

export const curriculum = [
  { week: 1, title: "구원의 확신", done: true, current: false },
  { week: 2, title: "하나님과의 관계 정립", done: true, current: false },
  { week: 3, title: "성경을 읽고 이해하기", done: true, current: false },
  { week: 4, title: "신앙의 근본 세우기", done: true, current: true },
  { week: 5, title: "신앙적 의문과 답", done: false, current: false },
  { week: 6, title: "하나님과 이웃의 관계", done: false, current: false },
  { week: 7, title: "교회 공동체와 봉사", done: false, current: false },
  { week: 8, title: "생명의 삶 적용", done: false, current: false },
] as const;

export const notices = [
  {
    scope: "4주차 공지",
    read: "읽음 18 / 20명",
    title: "이번 주는 구원의 확신과 신앙의 근본을 함께 다룹니다",
  },
  {
    scope: "전체 공지",
    read: "읽음 16 / 20명",
    title: "생명의 삶 수료 후 이후 필수·선택 과정을 신청할 수 있어요",
  },
] as const;

export const schedule = [
  {
    week: "4주차",
    title: "신앙의 근본 세우기",
    date: "6.24 수 19:30",
    attendance: "출석 예정",
  },
  {
    week: "3주차",
    title: "성경을 읽고 이해하기",
    date: "6.17 수 19:30",
    attendance: "출석",
  },
  {
    week: "2주차",
    title: "하나님과의 관계 정립",
    date: "6.10 수 19:30",
    attendance: "지각",
  },
] as const;

export const assignments = [
  { week: "4주차", title: "구원의 확신 나눔지", state: "미확인" },
  { week: "3주차", title: "성경 읽기 적용 기록", state: "제출 확인" },
] as const;

export const lifeStudyStatusLabel: Record<LifeStudyOverviewStatus, string> = {
  completed: "수료",
  recommended: "추천",
  pending: "대기",
};

export function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
