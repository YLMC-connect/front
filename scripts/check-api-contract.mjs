// 백엔드 Swagger(OpenAPI) 문서가 앱이 쓰는 API 계약을 담고 있는지 도메인별로 확인한다.
// 사용: node scripts/check-api-contract.mjs [도메인...]  (인자가 없으면 전체)
// 출처: YLMC_OPENAPI_URL, YLMC_OPENAPI_FILE, 또는 EXPO_PUBLIC_API_URL 의 /v3/api-docs
import * as auth from "./api-contract/auth.mjs";
import * as group from "./api-contract/group.mjs";
import * as home from "./api-contract/home.mjs";
import * as lifeStudy from "./api-contract/life-study.mjs";
import * as market from "./api-contract/market.mjs";
import * as mypage from "./api-contract/mypage.mjs";
import * as prayer from "./api-contract/prayer.mjs";
import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const domains = {
  auth,
  market,
  group,
  "life-study": lifeStudy,
  home,
  prayer,
  mypage,
};

const requested = process.argv.slice(2);
const unknown = requested.filter((name) => !domains[name]);
if (unknown.length > 0) {
  console.error(
    `알 수 없는 도메인: ${unknown.join(", ")} (사용 가능: ${Object.keys(domains).join(", ")})`,
  );
  process.exit(1);
}

const spec = await loadOpenApi();
for (const name of requested.length > 0 ? requested : Object.keys(domains)) {
  const contract = createOpenApiContract(spec);
  domains[name].check(contract);
  contract.report(domains[name].label);
}
