import {
  createOpenApiContract,
  loadOpenApi,
} from "./openapi-contract-utils.mjs";

const contract = createOpenApiContract(await loadOpenApi());
const {
  requireConcreteRequest,
  requireConcreteSuccess,
  requirePublicOperation,
  requireResolvableSecurity,
} = contract;

requireConcreteRequest("로그인", "/api/auth/login", "post");
requireConcreteSuccess("로그인", "/api/auth/login", "post");
requirePublicOperation("로그인", "/api/auth/login", "post");

requireConcreteRequest("토큰 재발급", "/api/auth/refresh", "post");
requireConcreteSuccess("토큰 재발급", "/api/auth/refresh", "post");
requirePublicOperation("토큰 재발급", "/api/auth/refresh", "post");

requireConcreteRequest("회원가입", "/api/signup", "post");
requireConcreteSuccess("회원가입", "/api/signup", "post");
requirePublicOperation("회원가입", "/api/signup", "post");

requireConcreteSuccess("내 정보 조회", "/api/member/me", "get");
requireResolvableSecurity("내 정보 조회", "/api/member/me", "get");

contract.report("인증 API");
