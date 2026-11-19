import { File } from "expo-file-system";
import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import { resizeImageForUpload } from "../lib/resizeImage";
import { useAuthStore } from "../store/authStore";
import type { MarketDataSource } from "./marketService";
import {
  mapShareComment,
  mapShareCommentList,
  mapShareDetail,
  mapShareOverviewItem,
  toShareCategoryCode,
  toShareStatus,
  toShareItemStatus,
} from "./marketMapper";
import type { MarketCategory } from "../types/market";
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

// expo 57.0.32 부터 전역 fetch 가 expo/fetch 라 RN 식 { uri, name, type } 파트를 지원하지 않는다.
// Blob 을 구현한 expo-file-system File 로 넣어야 한다.
function appendShareImage(form: FormData, uri: string, index: number) {
  const file = new File(uri);
  form.append("images", file, file.name || `image-${index}.jpg`);
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
    async getOverviewPage({
      lastId,
      size = 20,
      category,
    }: {
      lastId?: number | null;
      size?: number;
      category?: Exclude<MarketCategory, "all">;
    } = {}) {
      const query = new URLSearchParams({ size: String(size) });
      if (lastId != null) query.set("lastId", String(lastId));
      if (category) {
        const categoryCode = toShareCategoryCode(category);
        if (categoryCode) query.set("categoryCode", categoryCode);
      }
      const data = await client.request<ShareListResponseDto>(
        `/api/share?${query.toString()}`,
      );
      const content = data?.content ?? [];
      const items = [];
      for (const item of content) {
        const mapped = mapShareOverviewItem(item, currentUserId());
        if (mapped) items.push(mapped);
      }
      return {
        items,
        hasNext: Boolean(data?.hasNext),
        nextCursor: data?.nextCursor ?? null,
      };
    },

    async getMyOverviewPage({
      lastId,
      size = 20,
      category,
    }: {
      lastId?: number | null;
      size?: number;
      category?: Exclude<MarketCategory, "all">;
    } = {}) {
      const query = new URLSearchParams({ size: String(size) });
      if (lastId != null) query.set("lastId", String(lastId));
      if (category) {
        const categoryCode = toShareCategoryCode(category);
        if (categoryCode) query.set("categoryCode", categoryCode);
      }
      const data = await client.request<ShareListResponseDto>(
        `/api/share/my?${query.toString()}`,
      );
      const items = [];
      for (const item of data?.content ?? []) {
        const mapped = mapShareOverviewItem(item, currentUserId());
        if (mapped) items.push({ ...mapped, isMine: true });
      }
      return {
        items,
        hasNext: Boolean(data?.hasNext),
        nextCursor: data?.nextCursor ?? null,
      };
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
      form.append("location", input.location);
      // 업로드 직전에 긴 변 1600px·JPEG 0.8 로 줄인다 (실패하면 원본)
      // 한 장씩 차례로 변환한다(동시에 돌리면 느려짐)
      const uploadUris: string[] = [];
      for (const uri of input.images) {
        uploadUris.push(await resizeImageForUpload(uri));
      }
      uploadUris.forEach((uri, index) => appendShareImage(form, uri, index));

      const createdId = await client.request<number>("/api/share", {
        method: "POST",
        body: form,
      });
      if (createdId == null) {
        throw new Error("나눔 등록 결과를 확인할 수 없습니다.");
      }
      return getDetail(String(createdId));
    },

    async updatePost(input) {
      const itemStatus = toShareItemStatus(input.condition);
      if (!itemStatus) {
        throw new Error("물품 상태를 확인할 수 없습니다.");
      }

      // 남은 사진 중 서버 사진은 id 로 유지하고, 새로 고른 사진만 올린다.
      // keepImageIds 에 없는 서버 사진은 서버가 지운다.
      const idByUrl = new Map(
        input.existingImages.map((image) => [image.url, image.id]),
      );
      const keepImageIds = input.images
        .map((uri) => idByUrl.get(uri))
        .filter((id): id is string => Boolean(id));
      const newUris = input.images.filter((uri) => !idByUrl.has(uri));
      const fields = {
        title: input.title,
        content: input.description,
        categoryCode: toShareCategoryCode(input.category),
        itemStatus,
        location: input.location,
      };

      if (newUris.length === 0) {
        await client.request(`/api/share/${input.marketId}`, {
          method: "PUT",
          body: JSON.stringify({
            ...fields,
            keepImageIds: keepImageIds.map(Number),
          }),
        });
        return getDetail(input.marketId);
      }

      const form = new FormData();
      Object.entries(fields).forEach(([key, value]) => form.append(key, value));
      keepImageIds.forEach((id) => form.append("keepImageIds", id));
      const uploadUris: string[] = [];
      for (const uri of newUris) {
        uploadUris.push(await resizeImageForUpload(uri));
      }
      uploadUris.forEach((uri, index) => appendShareImage(form, uri, index));
      await client.request(`/api/share/${input.marketId}`, {
        method: "PUT",
        body: form,
      });
      return getDetail(input.marketId);
    },

    async deletePost(input) {
      await client.request(`/api/share/${input.marketId}`, {
        method: "DELETE",
      });
    },

    async updateStatus(input) {
      await client.request(`/api/share/${input.marketId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: toShareStatus(input.status) }),
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
  };
}

export const httpMarketDataSource = createHttpMarketDataSource();
