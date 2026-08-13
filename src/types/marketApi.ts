export interface ShareListItemDto {
  id: number;
  title: string;
  status: string;
  categoryCode: string;
  itemStatus?: string;
  authorId: string;
  createdAt: string;
  viewCount?: number;
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
