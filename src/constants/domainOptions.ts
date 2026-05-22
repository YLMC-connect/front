export const MARKET_CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "cloth", label: "의류·잡화" },
  { key: "home", label: "가전·가구" },
  { key: "book", label: "도서·문구" },
  { key: "food", label: "식품·생필품" },
  { key: "baby", label: "유아·아동용품" },
  { key: "sport", label: "스포츠·취미" },
  { key: "etc", label: "기타" },
] as const;

export const MARKET_STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "sharing", label: "나눔중" },
  { key: "reserved", label: "예약중" },
  { key: "done", label: "나눔완료" },
] as const;

export const MARKET_REPORT_REASONS = [
  { key: "inappropriate", label: "부적절한 내용" },
  { key: "spam", label: "홍보·스팸" },
  { key: "abuse", label: "비방·괴롭힘" },
  { key: "no_show", label: "약속 불이행" },
  { key: "other", label: "기타" },
] as const;

export const GROUP_CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "bible", label: "성경공부·예배" },
  { key: "pray", label: "기도모임" },
  { key: "volunteer", label: "봉사" },
  { key: "hobby", label: "취미·문화" },
  { key: "sport", label: "운동·건강" },
  { key: "cell", label: "목장" },
  { key: "mission", label: "선교" },
  { key: "carpool", label: "카풀" },
  { key: "etc", label: "기타" },
] as const;

export const GROUP_STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "open", label: "모집중" },
  { key: "joined", label: "참여중" },
  { key: "favorite", label: "관심" },
] as const;

export const LIFE_STUDY_STATUS_TABS = [
  { key: "all", label: "전체" },
  { key: "upcoming", label: "예정" },
  { key: "ongoing", label: "진행중" },
  { key: "completed", label: "완료" },
] as const;

export const PRAYER_WEEKDAY_TABS = [
  { key: "all", label: "전체" },
  { key: "mon", label: "월" },
  { key: "tue", label: "화" },
  { key: "wed", label: "수" },
  { key: "thu", label: "목" },
  { key: "fri", label: "금" },
] as const;
