# 처음 실행하기

이 저장소를 받은 사람이 **앱을 띄우고 라이브 API에 붙이는** 최소 안내입니다.
화면 구조·Phase·AI 작업 규칙은 [INDEX.md](INDEX.md), [README.md](../README.md)를 보세요.

## 1. 준비물

| 항목            | 기준                                                                               |
| --------------- | ---------------------------------------------------------------------------------- |
| Node.js         | `^22.13.0` 또는 `^24.3.0` 또는 `>=25.0.0` (`package.json` `engines`). CI는 22.22.0 |
| npm             | Node와 함께 오는 버전 (CI는 npm 10)                                                |
| Expo Dev Client | Expo Go가 아니라 development build                                                 |
| iOS             | Xcode + 시뮬레이터 또는 실기기                                                     |
| Android         | Android Studio + Emulator 또는 실기기, JDK 17+                                     |

저장소 클론:

```bash
git clone https://github.com/YLMC-connect/front.git
cd front
npm install
cp .env.example .env
```

`.env`에 팀에서 받은 API origin을 `EXPO_PUBLIC_API_URL`로 넣으세요. `.env`는 gitignore라 커밋되지 않습니다. 실제 주소는 저장소·문서에 두지 않습니다.

## 2. 앱 실행

처음 한 번은 development build를 설치합니다.

```bash
npm run ios:dev-client
# 또는
npm run android:dev-client
```

이미 빌드가 있으면 Metro만 띄웁니다.

```bash
npm run start:dev-client
```

같은 Wi-Fi의 기기에서 Dev Client로 이 Metro에 연결합니다. 포트만 확인할 때는:

```bash
npm run start:dev-client -- --port 8081 --localhost
```

웹으로 UI만 볼 수는 있지만, 검증 기준은 Dev Client입니다.

## 3. 실제 API 연결

모든 도메인이 라이브 API를 씁니다. `EXPO_PUBLIC_API_URL`이 없으면 Expo config가 바로 실패합니다.

```bash
cp .env.example .env
# .env 의 EXPO_PUBLIC_API_URL= 뒤에 팀에서 받은 origin을 넣습니다
```

명령 앞에 붙여도 됩니다.

```bash
EXPO_PUBLIC_API_URL=https://example.test npm run start:dev-client
```

환경 변수 이름은 [`.env.example`](../.env.example)에 있습니다. EAS 빌드도 같은 변수를 시크릿/프로필 env로 넣습니다.

라이브 서버에 가입한 계정으로 로그인하세요.

### API 로 보내지 않는 것

나눔 신고는 서버의 신고 사유 코드가 확정되지 않아 보내지 않습니다.

## 4. 검증

```bash
npm run validate
```

typecheck, lint, prettier, 스크립트 테스트, Jest를 순서대로 돌립니다. PR CI도 이 명령입니다.

계약 검사(`npm run test:api:contract`, 도메인만 볼 때는 `npm run test:api:contract -- <도메인>`)는 Swagger 문서 공백이 있으면 실패하도록 따로 둡니다. 일반 `validate`에는 넣지 않습니다.

## 5. 막힐 때

- **`EXPO_PUBLIC_API_URL이 필요합니다`** — `.env`에 팀에서 받은 origin이 없습니다.
- **웹에서 라이브 API가 안 됨** — 브라우저 CORS. 서버 CORS를 넣지 않는 한 웹은 검증 대상이 아닙니다. Dev Client를 쓰세요.
- **Expo Go로 열림** — `start:dev-client`와 development build를 쓰세요. bundle id는 `com.ylmc.connect.dev`.
- **나눔/동행 목록이 비어 있음** — 라이브 서버에 데이터가 없는 정상 상태일 수 있습니다.
- **iOS `pod install` 이 `incompatible character encodings` 로 실패** — 프로젝트 경로에 한글 등 영문이 아닌 글자가 있으면 CocoaPods 가 실패합니다. 영문 경로(예: `~/dev/ylmc-front`)로 옮기세요.
- **Metro가 안 붙음** — 기기와 맥이 같은 네트워크인지, Android Emulator면 `adb reverse tcp:8081 tcp:8081`을 확인하세요.
- **문서 지도** — 작업자 진입점은 [INDEX.md](INDEX.md), 유지보수는 [MAINTENANCE.md](MAINTENANCE.md).
