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
  { key: "prohibited_item", label: "금지 품목 게시" },
  { key: "false_information", label: "허위 물품 정보" },
  { key: "payment_request", label: "금전 요구·암묵적 거래 유도" },
  { key: "duplicate_post", label: "동일 물품 중복 게시" },
  { key: "stolen_image", label: "타인 사진 무단 도용" },
  { key: "advertising", label: "나눔을 빙자한 홍보·광고" },
  { key: "abusive", label: "욕설·혐오 표현" },
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
