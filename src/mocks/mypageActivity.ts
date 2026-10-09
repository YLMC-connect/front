import type {
  MyPageActivityComment,
  MyPageActivityGroup,
  MyPageActivityPost,
} from "../types/mypage";

/** 활동 화면이 쓰던 로컬 목록. 문구는 그대로 둔다. */
export const mockActivityPosts: readonly MyPageActivityPost[] = [
  {
    id: "local-post-1",
    thumb: 0,
    title: "유아용 카시트 나눔해요",
    status: "나눔완료",
    tone: "mute",
    date: "2026.05.12",
  },
  {
    id: "local-post-2",
    thumb: 1,
    title: "타쇐 프라이팬 새것 같은 상태",
    status: "나눔중",
    tone: "primary",
    date: "2026.05.08",
  },
  {
    id: "local-post-3",
    thumb: 2,
    title: "어린이 동화책 30권 묶음",
    status: "예약완료",
    tone: "warn",
    date: "2026.04.30",
  },
  {
    id: "local-post-4",
    thumb: 3,
    title: "도자기 다세트 (몇 개 파손 있음)",
    status: "나눔완료",
    tone: "mute",
    date: "2026.04.21",
  },
  {
    id: "local-post-5",
    thumb: 4,
    title: "아이 가을 웃 (90사이즈 남아 있어요)",
    status: "나눔중",
    tone: "primary",
    date: "2026.04.10",
  },
];

export const mockActivityComments: readonly MyPageActivityComment[] = [
  {
    id: "local-comment-1",
    content: "저희 목장 아이도 몇 달 전까지 이거 잘 썰어요! 공감이네요 ツ",
    src: "유아용 카시트 나눔해요",
    date: "오늘",
  },
  {
    id: "local-comment-2",
    content: "좋은 나눔 감사해요! 내일 아침 들르겠습니다",
    src: "도자기 다세트 (몇 개 파손 있음)",
    date: "어제",
  },
  {
    id: "local-comment-3",
    content: "앞으로도 잘 부탁드려요 ✍🏻",
    src: "토요 산악회 · 5/18 모임",
    date: "2일 전",
  },
  {
    id: "local-comment-4",
    content: "이 게시글 아주 유익했어요. 저도 같이 나눠볼게요",
    src: "의자 수리해 드립니다",
    date: "4일 전",
  },
  {
    id: "local-comment-5",
    content: "이번 주 수요일 일정 있으신가요?",
    src: "독서 나눔 · 5월 정기모임",
    date: "지난주",
  },
];

export const mockActivityGroups: readonly MyPageActivityGroup[] = [
  {
    id: "local-group-1",
    name: "토요 산악회",
    members: 18,
    joined: "2024.11.02",
    seed: 0,
  },
  {
    id: "local-group-2",
    name: "독서 나눔",
    members: 12,
    joined: "2025.02.18",
    seed: 1,
  },
  {
    id: "local-group-3",
    name: "엄마들의 수다방",
    members: 24,
    joined: "2025.06.07",
    seed: 3,
  },
  {
    id: "local-group-4",
    name: "찬양 프도는 이와 함께",
    members: 9,
    joined: "2025.09.14",
    seed: 4,
  },
];
