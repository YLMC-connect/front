import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import { useAuthStore } from "../store/authStore";
import type { MarketDataSource } from "./marketService";
import {
  mapShareComment,
  mapShareCommentList,
  mapShareDetail,
  mapShareOverviewItem,
  toShareCategoryCode,
  toShareItemStatus,
} from "./marketMapper";
import type {
  ShareCommentDto,
  ShareDetailDto,
  ShareListResponseDto,
} from "../types/marketApi";

type MarketApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

type CurrentUser = {
  id: string | null;
  name: string | null;
};

function defaultCurrentUser(): CurrentUser {
  const user = useAuthStore.getState().currentUser;
  return { id: user?.id ?? null, name: user?.name ?? null };
}

function appendShareImage(form: FormData, uri: string, index: number) {
  const filename = uri.split("/").pop() || `image-${index}.jpg`;
  form.append("images", {
    uri,
    name: filename,
    type: "image/jpeg",
  } as unknown as Blob);
}

export function createHttpMarketDataSource({
  client = apiClient,
  getCurrentUser = defaultCurrentUser,
}: {
  client?: MarketApiClient;
  getCurrentUser?: () => CurrentUser;
} = {}): MarketDataSource {
  const currentUserId = () => getCurrentUser().id;

  const getDetail = async (id: string) => {
    const [detail, comments] = await Promise.all([
      client.request<ShareDetailDto>(`/api/share/${id}`),
      client.request<ShareCommentDto[]>(`/api/share/${id}/comments`),
    ]);
    return mapShareDetail(
      detail,
      mapShareCommentList(comments ?? [], currentUserId()),
      currentUserId(),
    );
  };

  return {
    async getOverview() {
      const items = [];
      let lastId: number | undefined;
      for (let page = 0; page < 5; page += 1) {
        const query = new URLSearchParams({ size: "50" });
        if (lastId != null) query.set("lastId", String(lastId));
        const data = await client.request<ShareListResponseDto>(
          `/api/share?${query.toString()}`,
        );
        const content = data?.content ?? [];
        for (const item of content) {
          const mapped = mapShareOverviewItem(item, currentUserId());
          if (mapped) items.push(mapped);
        }
        if (!data?.hasNext || data.nextCursor == null) break;
        lastId = data.nextCursor;
      }
      return { items };
    },

    getDetail,

    async createPost(input) {
      const itemStatus = toShareItemStatus(input.condition);
      if (!itemStatus) {
        throw new Error("물품 상태를 확인할 수 없습니다.");
      }

      const form = new FormData();
      form.append("title", input.title);
      form.append("content", input.description);
      form.append("categoryCode", toShareCategoryCode(input.category));
      form.append("itemStatus", itemStatus);
      input.images.forEach((uri, index) => appendShareImage(form, uri, index));

      const createdId = await client.request<number>("/api/share", {
        method: "POST",
        body: form,
      });
      if (createdId == null) {
        throw new Error("나눔 등록 결과를 확인할 수 없습니다.");
      }
      return getDetail(String(createdId));
    },

    async deletePost(input) {
      await client.request(`/api/share/${input.marketId}`, {
        method: "DELETE",
      });
    },

    async createComment(input) {
      const createdId = await client.request<number>(
        `/api/share/${input.marketId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ content: input.content }),
        },
      );
      if (createdId == null) {
        throw new Error("댓글 등록 결과를 확인할 수 없습니다.");
      }
      const user = getCurrentUser();
      return (
        mapShareComment(
          {
            id: createdId,
            content: input.content,
            authorId: user.id ?? "",
            authorName: user.name ?? user.id ?? "",
            createdAt: new Date().toISOString(),
          },
          user.id,
        ) ?? {
          id: String(createdId),
          authorName: user.name ?? user.id ?? "",
          createdLabel: "방금 전",
          content: input.content,
          isMine: true,
          isEdited: false,
          isDeleted: false,
        }
      );
    },

    async updateComment(input) {
      await client.request(`/api/share/comments/${input.commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: input.content }),
      });
      const comments = mapShareCommentList(
        (await client.request<ShareCommentDto[]>(
          `/api/share/${input.marketId}/comments`,
        )) ?? [],
        currentUserId(),
      );
      const updated = comments.find(
        (comment) => comment.id === input.commentId,
      );
      if (!updated) {
        throw new Error("수정한 댓글을 확인할 수 없습니다.");
      }
      return updated;
    },

    async deleteComment(input) {
      await client.request(`/api/share/comments/${input.commentId}`, {
        method: "DELETE",
      });
    },

    async reportContent() {
      throw new Error(
        "신고 사유 코드가 서버에 확정되지 않아 접수할 수 없습니다.",
      );
    },
  };
}

export const httpMarketDataSource = createHttpMarketDataSource();
