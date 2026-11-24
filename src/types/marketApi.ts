export interface ShareListItemDto {
  id: number;
  title: string;
  status: string;
  categoryCode: string;
  itemStatus?: string;
  authorId: string;
  createdAt: string;
  viewCount?: number;
  /** 대표(첫 번째) 사진 경로. 사진이 없으면 null */
  imageUrl?: string | null;
}

export interface ShareListResponseDto {
  content: ShareListItemDto[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface ShareAttachmentDto {
  id: number;
  imageUrl: string;
  originalName?: string;
  sortOrder?: number;
}

export interface ShareDetailDto {
  id: number;
  title: string;
  content: string;
  status: string;
  categoryCode: string;
  itemStatus?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  images?: ShareAttachmentDto[];
  viewCount?: number;
}

export interface ShareCommentDto {
  id: number;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

/** GET /api/share/categories 항목. 노출 순서(orderNum) 오름차순. */
export interface ShareCategoryDto {
  id: number;
  code: string;
  name: string;
  orderNum: number | null;
}
