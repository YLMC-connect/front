import {
  GROUP_STATUS_TABS,
  LIFE_STUDY_STATUS_TABS,
  MARKET_REPORT_REASONS,
  MARKET_STATUS_TABS,
  PRAYER_WEEKDAY_TABS,
} from "../domainOptions";

describe("domain options", () => {
  it("keeps the v1 market tabs available", () => {
    expect(MARKET_STATUS_TABS.map((tab) => tab.label)).toEqual([
      "전체",
      "나눔중",
      "예약중",
      "나눔완료",
    ]);
  });

  it("keeps the design-approved market report reasons available", () => {
    expect(MARKET_REPORT_REASONS.map(({ label }) => label)).toEqual([
      "금지 품목 게시",
      "허위 물품 정보",
      "금전 요구·암묵적 거래 유도",
      "동일 물품 중복 게시",
      "타인 사진 무단 도용",
      "나눔을 빙자한 홍보·광고",
      "욕설·혐오 표현",
      "기타",
    ]);
  });

  it("keeps the v1 group tabs available", () => {
    expect(GROUP_STATUS_TABS.map((tab) => tab.label)).toEqual([
      "전체",
      "모집중",
      "참여중",
      "관심",
    ]);
  });

  it("keeps life study and prayer entry filters available", () => {
    expect(LIFE_STUDY_STATUS_TABS.map((tab) => tab.label)).toEqual([
      "전체",
      "예정",
      "진행중",
      "완료",
    ]);
    expect(PRAYER_WEEKDAY_TABS.map((tab) => tab.label)).toEqual([
      "전체",
      "월",
      "화",
      "수",
      "목",
      "금",
    ]);
  });
});
