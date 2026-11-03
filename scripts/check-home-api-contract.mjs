import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const contract = createOpenApiContract(await loadOpenApi());
const {
  requireOperation,
  requireConcreteSuccess,
  requireProperties,
  failures,
} = contract;

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

if (failures.length > 0) {
  console.error(
    `홈 큐레이션(설교/큐티) API 계약 검증 실패 (${failures.length}건)`,
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("홈 큐레이션(설교/큐티) API 계약 검증 통과");
