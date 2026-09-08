# 처음 실행하기

이 저장소를 받은 사람이 **앱을 띄우고 라이브 API에 붙이는** 최소 안내입니다.
화면 구조·Phase·AI 작업 규칙은 [INDEX.md](INDEX.md), [README.md](../README.md)를 보세요.

## 1. 준비물

| 항목 | 기준 |
|---|---|
| Node.js | `>= 20.19.4` (`package.json` `engines`) |
| npm | Node와 함께 오는 버전 (CI는 npm 10) |
| Expo Dev Client | Expo Go가 아니라 development build |
| iOS | Xcode + 시뮬레이터 또는 실기기 |
| Android | Android Studio + Emulator 또는 실기기, JDK 17+ |

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

`APP_VARIANT=development`(기본)이면 인증·나눔·동행 adapter는 **HTTP**입니다.
HTTP를 쓰는 동안 `EXPO_PUBLIC_API_URL`이 없으면 Expo config가 바로 실패합니다.

```bash
cp .env.example .env
# .env 의 EXPO_PUBLIC_API_URL= 뒤에 팀에서 받은 origin을 넣습니다
```

명령 앞에 붙여도 됩니다.

```bash
EXPO_PUBLIC_API_URL=https://example.test npm run start:dev-client
```

환경 변수 이름은 [`.env.example`](../.env.example)에 있습니다. EAS 빌드도 같은 변수를 시크릿/프로필 env로 넣습니다.

라이브 계정으로 로그인하세요. Maestro용 `admin` / `admin`은 **mock adapter 전용**이라 라이브 서버에서는 통하지 않습니다.

### 지금 라이브로 붙는 것

| 도메인 | HTTP | 비고 |
|---|---|---|
| 인증 | login / refresh / signup / me / 중복확인 | development 기본 |
| 나눔 | 목록·상세·등록·삭제·댓글 CUD | 목록에 작성자 이름·썸네일 URL이 없으면 ID/placeholder |
| 동행 | 목록·내 목록·상세·멤버·개설·공지 CUD·**참여/탈퇴** | 일정·장소 필드는 서버가 안 받음 |

### 아직 mock인 것

홈 오늘 기도/새벽 말씀, 기도 탭, 삶공부 탭은 사용자 API가 없어 mock service를 씁니다.
나눔 신고 사유 코드·나눔 상태 변경·동행 강퇴/이관은 계약이 비어 있어 HTTP로 보내지 않습니다.

## 4. Mock으로 돌리기

단위 테스트는 이미 mock adapter입니다 (`jest.setup.ts`).
앱을 mock 데이터·`admin`/`admin`으로 띄울 때만:

```bash
EXPO_PUBLIC_AUTH_ADAPTER=mock \
EXPO_PUBLIC_MARKET_ADAPTER=mock \
EXPO_PUBLIC_GROUP_ADAPTER=mock \
npm run start:dev-client
```

## 5. 검증

```bash
npm run validate
```

typecheck, lint, prettier, 스크립트 테스트, Jest를 순서대로 돌립니다. PR CI도 이 명령입니다.

계약 검사(`npm run test:api:contract*`)는 Swagger 문서 공백이 있으면 실패하도록 따로 둡니다. 일반 `validate`에는 넣지 않습니다.

## 6. 막힐 때

- **`EXPO_PUBLIC_API_URL이 필요합니다`** — `.env`에 팀에서 받은 origin이 없습니다. mock만 띄울 때는 `EXPO_PUBLIC_*_ADAPTER=mock`.
- **웹에서 라이브 API가 안 됨** — 브라우저 CORS. 서버 CORS를 넣지 않는 한 웹은 검증 대상이 아닙니다. Dev Client를 쓰세요.
- **Expo Go로 열림** — `start:dev-client`와 development build를 쓰세요. bundle id는 `com.ylmc.connect.dev`.
- **로그인 실패 (`admin`/`admin`)** — 라이브 모드입니다. 실제 가입 계정을 쓰거나 mock adapter로 전환하세요.
- **나눔/동행 목록이 비어 있음** — 라이브 서버에 데이터가 없는 정상 상태일 수 있습니다. mock로 바꾸면 픽스처가 보입니다.
- **Metro가 안 붙음** — 기기와 맥이 같은 네트워크인지, Android Emulator면 `adb reverse tcp:8081 tcp:8081`을 확인하세요.
- **문서 지도** — 작업자 진입점은 [INDEX.md](INDEX.md), 유지보수는 [MAINTENANCE.md](MAINTENANCE.md).
