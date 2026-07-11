import type {
  GroupDetail,
  GroupMemberDetail,
  GroupOverview,
} from "../types/group";

export const mockGroupOverview: GroupOverview = {
  groups: [
    {
      id: "1",
      name: "토요 산악회",
      category: "sport",
      description:
        "매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다. 등산 초보도 환영해요.",
      currentMembers: 18,
      maxMembers: 25,
      status: "open",
      coverSeed: 0,
      isJoined: true,
    },
    {
      id: "2",
      name: "독서 나눔",
      category: "hobby",
      description:
        "매월 한 권의 책을 함께 읽고 나눠요. 신앙서부터 에세이까지 다양하게 선정합니다.",
      currentMembers: 12,
      maxMembers: 15,
      status: "open",
      coverSeed: 1,
      isJoined: true,
    },
    {
      id: "3",
      name: "엄마들의 수다방",
      category: "cell",
      description:
        "아이 키우는 엄마들이 일상과 신앙을 나누는 따뜻한 공간입니다.",
      currentMembers: 24,
      maxMembers: 30,
      status: "open",
      coverSeed: 3,
      isJoined: true,
    },
    {
      id: "4",
      name: "화요 새벽기도회",
      category: "pray",
      description:
        "화요일 새벽 5시 30분, 함께 무릎 꿇는 자리. 한 주를 기도로 시작해요.",
      currentMembers: 32,
      maxMembers: 50,
      status: "open",
      coverSeed: 2,
      isJoined: false,
    },
    {
      id: "5",
      name: "어르신 돌봄 봉사",
      category: "volunteer",
      description:
        "한 달에 두 번 인근 요양원을 방문해 어르신들과 시간을 보내요.",
      currentMembers: 8,
      maxMembers: 12,
      status: "open",
      coverSeed: 4,
      isJoined: false,
    },
    {
      id: "6",
      name: "찬양 동아리",
      category: "hobby",
      description:
        "함께 찬양하고 연주하며 마음을 모아요. 매주 금요일 저녁 7시에 모입니다.",
      currentMembers: 15,
      maxMembers: 15,
      status: "closed",
      coverSeed: 5,
      isJoined: false,
    },
  ],
  services: [
    {
      id: "service-1",
      name: "주방 봉사팀",
      description: "주일 점심 준비와 정리를 함께 섬깁니다.",
      schedule: "주일 10:30",
      currentMembers: 18,
      maxMembers: 24,
      statusLabel: "모집중",
      coverSeed: 2,
      linkedGroupId: "5",
    },
    {
      id: "service-2",
      name: "성가대 신입 모집",
      description: "찬양으로 예배를 섬길 성도를 기다립니다.",
      schedule: "주일 08:40",
      currentMembers: 5,
      maxMembers: 10,
      statusLabel: "모집중",
      coverSeed: 5,
      linkedGroupId: "5",
    },
    {
      id: "service-3",
      name: "어르신 돌봄 봉사",
      description: "월 2회 인근 요양원을 방문해 교제합니다.",
      schedule: "둘째·넷째 토요일",
      currentMembers: 8,
      maxMembers: 12,
      statusLabel: "모집중",
      coverSeed: 4,
      linkedGroupId: "5",
    },
  ],
};

export const mockGroupDetails: Record<string, GroupDetail> = {
  "1": {
    id: "1",
    name: "토요 산악회",
    description:
      "매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.\n등산 초보도 환영해요. 등산화·물·간식만 챙겨오시면 돼요.\n모임 일정과 코스는 매주 화요일 공지로 안내드립니다.",
    categoryLabel: "운동·건강",
    currentMembers: 18,
    maxMembers: 25,
    status: "open",
    leaderName: "김은혜",
    isLeader: true,
    isJoined: true,
    members: ["김은혜", "박정아", "이수진", "김지영", "정혜진", "조미경"],
    notices: [
      {
        id: "notice-1",
        title: "5월 18일 토요일 모임 안내",
        content:
          "이번 주 토요일은 북한산 도선사 코스로 갑니다. 오전 7시 교회 앞에서 모이며, 등산 시간은 약 4시간 예상해요. 준비물은 등산화, 물, 간식입니다.",
        preview:
          "이번 주 토요일은 북한산 도선사 코스로 갑니다. 오전 7시 교회 앞에서 모입니다.",
        createdLabel: "2일 전",
        isEdited: false,
      },
      {
        id: "notice-2",
        title: "신규 멤버 환영합니다",
        content:
          "이번 달에 새로 합류해주신 분들 진심으로 환영해요. 다음 모임 때 소개 시간이 있을 예정입니다.",
        preview:
          "이번 달에 새로 합류해주신 분들 진심으로 환영해요. 다음 모임 때 소개 시간이 있을 예정입니다.",
        createdLabel: "1주 전",
        isEdited: true,
      },
    ],
  },
};

export const mockGroupMembers: Record<string, GroupMemberDetail[]> = {
  "1": [
    {
      userId: "member-001",
      userName: "김은혜",
      joinedLabel: "2024.03.12",
      isLeader: true,
      isMine: true,
    },
    {
      userId: "member-002",
      userName: "박정아",
      joinedLabel: "2024.04.02",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-003",
      userName: "이수진",
      joinedLabel: "2024.05.18",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-006",
      userName: "김지영",
      joinedLabel: "2024.07.21",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-005",
      userName: "정혜진",
      joinedLabel: "2024.09.04",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-007",
      userName: "조미경",
      joinedLabel: "2024.11.10",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-008",
      userName: "한유라",
      joinedLabel: "2025.01.22",
      isLeader: false,
      isMine: false,
    },
    {
      userId: "member-009",
      userName: "강민서",
      joinedLabel: "2025.03.05",
      isLeader: false,
      isMine: false,
    },
  ],
};
