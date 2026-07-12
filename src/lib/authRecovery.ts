type RefreshAuth = () => Promise<void>;

let refreshAuth: RefreshAuth | undefined;

export function configureAuthRecovery(refresh: RefreshAuth) {
  refreshAuth = refresh;
}

export async function recoverAuth() {
  if (!refreshAuth) {
    throw new Error("인증 재발급 동작이 설정되지 않았습니다.");
  }

  await refreshAuth();
}
