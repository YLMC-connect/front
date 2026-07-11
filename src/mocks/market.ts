import type { MarketDetail, MarketOverview } from "../types/market";

export const mockMarketOverview: MarketOverview = {
  items: [
    {
      id: "1",
      thumbSeed: 0,
      title: "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
      authorName: "박정아",
      createdLabel: "1시간 전",
      status: "sharing",
    },
    {
      id: "2",
      thumbSeed: 1,
      title: "토스터기·전기주전자 세트 나눔해요",
      authorName: "이수진",
      createdLabel: "3시간 전",
      status: "reserved",
    },
    {
      id: "3",
      thumbSeed: 2,
      title: "유아용 카시트 (사용감 있음)",
      authorName: "김지영",
      createdLabel: "어제",
      status: "sharing",
    },
    {
      id: "4",
      thumbSeed: 3,
      title: "어린이 동화책 30권 묶음 나눔",
      authorName: "정혜진",
      createdLabel: "어제",
      status: "sharing",
    },
    {
      id: "5",
      thumbSeed: 4,
      title: "도자기 다세트 (몇 개 파손 있음)",
      authorName: "조미경",
      createdLabel: "2일 전",
      status: "done",
    },
    {
      id: "6",
      thumbSeed: 5,
      title: "아기 가을 옷 (90사이즈)",
      authorName: "한유라",
      createdLabel: "3일 전",
      status: "sharing",
    },
  ],
};

export const mockMarketDetails: Record<string, MarketDetail> = {
  "1": {
    id: "1",
    thumbSeed: 0,
    title: "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    content:
      "아이가 커서 더 이상 쓰지 않는 장난감 정리해요. 대부분 깨끗하게 사용한 것들이고, 블록류 20점 + 인형류 10점 정도 됩니다. 필요하신 분께 무료로 드려요!\n\n수령은 토요일 오후 교회 1층 로비에서 가능합니다. 한 분께 일괄로 드리려고 합니다.",
    categoryLabel: "유아·아동용품",
    conditionLabel: "사용감 있음",
    status: "sharing",
    authorName: "김은혜",
    createdLabel: "1시간 전",
    isMine: true,
    comments: [
      {
        id: "comment-1",
        authorName: "이수진",
        createdLabel: "30분 전",
        content: "필요해요! 토요일에 들를게요. 연락드릴게요 :)",
        isMine: false,
        isEdited: false,
        isDeleted: false,
      },
      {
        id: "comment-2",
        authorName: "김지영",
        createdLabel: "25분 전",
        content:
          "좋은 나눔 감사해요. 저도 비슷한 시기에 정리했는데 도움이 많이 됐어요!",
        isMine: false,
        isEdited: true,
        isDeleted: false,
      },
      {
        id: "comment-3",
        authorName: "정혜진",
        createdLabel: "20분 전",
        isMine: false,
        isEdited: false,
        isDeleted: true,
      },
      {
        id: "comment-4",
        authorName: "한유라",
        createdLabel: "10분 전",
        content: "아직 남아있을까요? 늦었지만 가능하면 부탁드려요.",
        isMine: true,
        isEdited: false,
        isDeleted: false,
      },
    ],
  },
};
