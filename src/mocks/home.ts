import type {
  HomeDailyPrayer,
  HomeDawnPrayer,
  HomeNotice,
  HomeWeekday,
} from "../types/home";

export const homeNotices: HomeNotice[] = [
  {
    id: "notice-home-001",
    title: "주일 2부 예배 시간 변경 안내",
    summary: "이번 주만 2부 예배가 11시 20분에 시작됩니다.",
    createdAt: "2026-05-22T00:00:00.000Z",
  },
  {
    id: "notice-home-002",
    title: "새가족 환영 모임",
    summary: "등록 3개월 이내 새가족을 위한 환영 모임이 있습니다.",
    createdAt: "2026-05-21T00:00:00.000Z",
  },
];

/** Fixed weekday prayer copy for home (mock-first). */
export const homeDailyPrayerByWeekday: Record<
  HomeWeekday,
  Omit<HomeDailyPrayer, "dateLabel" | "weekday" | "weekdayLabel">
> = {
  mon: {
    title: "가정과 일터에서 믿음의 선택을 하도록 도와주세요.",
    summary: "한 주를 시작하는 마음으로 가정과 교회를 위해 기도합니다.",
    href: "/prayer",
  },
  tue: {
    title: "새벽마다 주님을 찾고 말씀을 붙들게 하소서.",
    summary: "화요일, 조용한 가운데 하루를 주님께 맡깁니다.",
    href: "/prayer",
  },
  wed: {
    title: "아픈 성도와 회복이 필요한 가정을 돌봐 주세요.",
    summary: "수요 치유와 회복을 구하며 함께 중보합니다.",
    href: "/prayer",
  },
  thu: {
    title: "공동체 안에 용서와 화평이 흐르게 하소서.",
    summary: "목요일, 서로를 위해 중보하는 마음을 품습니다.",
    href: "/prayer",
  },
  fri: {
    title: "선교지와 다음 세대를 주님의 손에 맡깁니다.",
    summary: "금요 선교 중보로 세상을 향해 마음을 엽니다.",
    href: "/prayer",
  },
  sat: {
    title: "안식과 예배를 준비하는 마음을 주소서.",
    summary: "토요일, 한 주를 돌아보며 예배를 예비합니다.",
    href: "/prayer",
  },
  sun: {
    title: "예배 가운데 주님을 만나고 새 힘을 얻게 하소서.",
    summary: "주일, 함께 예배하며 은혜를 구합니다.",
    href: "/prayer",
  },
};

export const homeDawnPrayer: HomeDawnPrayer = {
  id: "dawn-prayer-default",
  title: "새벽기도 말씀요약",
  summary: "시편 23:1 — 여호와는 나의 목자시니 내게 부족함이 없으리로다.",
  timeLabel: "오늘 새벽 말씀",
  body: "본문\n시편 23:1-3\n\n여호와는 나의 목자시니 내게 부족함이 없으리로다.\n그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다.\n내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다.\n\n요약\n오늘 새벽 말씀은 주님을 목자로 모신 삶의 평안을 전합니다.\n부족함을 채우시는 분은 환경이 아니라 목자 되신 주님입니다.\n푸른 풀밭과 쉴 만한 물가는  hustle이 아니라 인도하심 안에서 누리는 안식입니다.\n\n적용\n1. 오늘 하루, ‘부족하다’는 마음 대신 목자 되신 주님을 먼저 인정합니다.\n2. 바쁜 일정 속에서도 영혼이 쉴 자리를 짧게라도 확보합니다.\n3. 내 길보다 의의 길을 선택하는 작은 순종을 실천합니다.\n\n기도\n목자 되신 주님, 오늘도 제 영혼을 푸른 자리로 이끌어 주시고\n부족함을 주님으로 채우게 하소서.",
  href: "/prayer/dawn",
};

const weekdayKeys: HomeWeekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const weekdayLabels: Record<HomeWeekday, string> = {
  sun: "일요일",
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
  sat: "토요일",
};

export function resolveHomeWeekday(date: Date = new Date()): HomeWeekday {
  return weekdayKeys[date.getDay()] ?? "mon";
}

export function formatHomeDateLabel(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function buildHomeDailyPrayer(date: Date = new Date()) {
  const weekday = resolveHomeWeekday(date);
  const copy = homeDailyPrayerByWeekday[weekday];
  return {
    dateLabel: formatHomeDateLabel(date),
    weekday,
    weekdayLabel: weekdayLabels[weekday],
    ...copy,
  };
}
