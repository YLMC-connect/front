/**
 * 설교(Sermon) 및 매일 큐티(Daily QT) API 응답 DTO
 * Notion 명세: 🎤 설교 (Sermon), 📖 매일 큐티 (Daily QT)
 */

export interface SermonResponse {
  id: number;
  title: string;
  sermonDate: string; // YYYY-MM-DD
  bibleText: string;
  preacher: string;
  youtubeUrl: string | null;
}

export interface DailyQtResponse {
  id: number;
  title: string;
  qtDate: string; // YYYY-MM-DD
  bibleText: string;
  content: string | null; // 목록에서는 null, 상세에서 HTML
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
}
