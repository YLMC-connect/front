import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";
import type { GroupDataSource } from "./groupService";
import {
  mapCommunionDetail,
  mapCommunionMemberList,
  mapCommunionNotice,
  mapCommunionNoticeList,
  mapCommunionOverviewItem,
  mapCommunionServiceItem,
  toCommunionCategoryCode,
  toNoticePreview,
} from "./groupMapper";
import type {
  CommunionDetailDto,
  CommunionListResponseDto,
  CommunionMemberDto,
  CommunionNoticeDto,
} from "../types/groupApi";

type GroupApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

function defaultCurrentUserId() {
  return useAuthStore.getState().currentUser?.id ?? null;
}

async function fetchCommunionPages(client: GroupApiClient, path: string) {
  const items: unknown[] = [];
  let lastId: number | undefined;
  for (let page = 0; page < 5; page += 1) {
    const query = new URLSearchParams({ size: "50" });
    if (lastId != null) query.set("lastId", String(lastId));
    const separator = path.includes("?") ? "&" : "?";
    const data = await client.request<CommunionListResponseDto>(
      `${path}${separator}${query.toString()}`,
    );
    items.push(...(data?.content ?? []));
    if (!data?.hasNext || data.nextCursor == null) break;
    lastId = data.nextCursor;
  }
  return items;
}

export function createHttpGroupDataSource({
  client = apiClient,
  getCurrentUserId = defaultCurrentUserId,
}: {
  client?: GroupApiClient;
  getCurrentUserId?: () => string | null;
} = {}): GroupDataSource {
  const mapMembers = (
    members: CommunionMemberDto[] | null,
    leaderId: string | null,
  ) => mapCommunionMemberList(members ?? [], leaderId, getCurrentUserId());

  const getMembers = async (id: string) => {
    const [detail, members] = await Promise.all([
      client.request<CommunionDetailDto>(`/api/communion/${id}`),
      client.request<CommunionMemberDto[]>(`/api/communion/${id}/members`),
    ]);
    const leaderId =
      detail && typeof detail === "object" && "leaderId" in detail
        ? String(detail.leaderId ?? "")
        : "";
    return mapMembers(members, leaderId || null);
  };

  const getDetail = async (id: string) => {
    const [detail, notices, members] = await Promise.all([
      client.request<CommunionDetailDto>(`/api/communion/${id}`),
      client.request<CommunionNoticeDto[]>(`/api/communion/${id}/notices`),
      client.request<CommunionMemberDto[]>(`/api/communion/${id}/members`),
    ]);
    const leaderId =
      detail && typeof detail === "object" && "leaderId" in detail
        ? String(detail.leaderId ?? "")
        : "";
    return mapCommunionDetail(
      detail,
      mapCommunionNoticeList(notices ?? []),
      mapMembers(members, leaderId || null),
      getCurrentUserId(),
    );
  };

  return {
    async getOverview() {
      const [groups, services, myGroups, myServices] = await Promise.all([
        fetchCommunionPages(client, "/api/communion?type=SMALL_GROUP"),
        fetchCommunionPages(client, "/api/communion?type=VOLUNTEER"),
        fetchCommunionPages(client, "/api/communion/my?type=SMALL_GROUP"),
        fetchCommunionPages(client, "/api/communion/my?type=VOLUNTEER"),
      ]);
      const joinedIds = new Set(
        [...myGroups, ...myServices]
          .map((item) =>
            item && typeof item === "object" && "id" in item
              ? String((item as { id: unknown }).id)
              : "",
          )
          .filter(Boolean),
      );
      return {
        groups: groups.flatMap((item) => {
          const mapped = mapCommunionOverviewItem(item, joinedIds);
          return mapped ? [mapped] : [];
        }),
        services: services.flatMap((item) => {
          const mapped = mapCommunionServiceItem(item);
          return mapped ? [mapped] : [];
        }),
      };
    },

    getDetail,
    getMembers,

    async createGroup(input) {
      const categoryCode = toCommunionCategoryCode(input.category);
      if (!categoryCode) {
        throw new Error("이 카테고리는 아직 서버에 없습니다.");
      }
      const createdId = await client.request<number>("/api/communion", {
        method: "POST",
        body: JSON.stringify({
          type: "SMALL_GROUP",
          title: input.name,
          content: input.description,
          categoryCode,
          maxParticipants: input.maxMembers,
        }),
      });
      if (createdId == null) {
        throw new Error("소모임 개설 결과를 확인할 수 없습니다.");
      }
      return getDetail(String(createdId));
    },

    async createNotice(input) {
      const createdId = await client.request<number>(
        `/api/communion/${input.groupId}/notices`,
        {
          method: "POST",
          body: JSON.stringify({
            title: input.title,
            content: input.content,
          }),
        },
      );
      if (createdId == null) {
        throw new Error("공지 등록 결과를 확인할 수 없습니다.");
      }
      return (
        mapCommunionNotice({
          id: createdId,
          title: input.title,
          content: input.content,
          createdAt: new Date().toISOString(),
        }) ?? {
          id: String(createdId),
          title: input.title,
          content: input.content,
          preview: toNoticePreview(input.content),
          createdLabel: "방금 전",
          isEdited: false,
        }
      );
    },

    async updateNotice(input) {
      await client.request(
        `/api/communion/${input.groupId}/notices/${input.noticeId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: input.title,
            content: input.content,
          }),
        },
      );
      const notices = mapCommunionNoticeList(
        (await client.request<CommunionNoticeDto[]>(
          `/api/communion/${input.groupId}/notices`,
        )) ?? [],
      );
      const updated = notices.find((notice) => notice.id === input.noticeId);
      if (!updated) {
        throw new Error("수정한 공지를 확인할 수 없습니다.");
      }
      return updated;
    },

    async deleteNotice(input) {
      await client.request(
        `/api/communion/${input.groupId}/notices/${input.noticeId}`,
        {
          method: "DELETE",
        },
      );
    },
  };
}

export const httpGroupDataSource = createHttpGroupDataSource();
