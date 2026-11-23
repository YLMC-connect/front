export const label = "홈 큐레이션(설교/큐티) API";

export function check({
  requireOperation,
  requireConcreteSuccess,
  requireProperties,
}) {
  // 1. 설교(Sermon) 목록
  requireConcreteSuccess("설교 목록", "/api/sermons", "get");
  requireProperties("SermonResponse", [
    "id",
    "title",
    "sermonDate",
    "bibleText",
    "preacher",
    "youtubeUrl",
  ]);

  // 2. 매일 큐티(Daily QT) 목록
  requireConcreteSuccess("매일 큐티 목록", "/api/daily-qt", "get");
  requireProperties("DailyQtResponse", [
    "id",
    "title",
    "qtDate",
    "bibleText",
    "content",
  ]);

  // 3. 매일 큐티(Daily QT) 상세
  requireOperation("매일 큐티 상세", "/api/daily-qt/{id}", "get");
}
