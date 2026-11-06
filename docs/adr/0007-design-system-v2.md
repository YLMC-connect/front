# ADR 0007 — 디자인 시스템 v2 반영

- **상태**: 수락
- **일자**: 2026-11-06
- **결정자**: 프로젝트 관리자
- **관련**: [ADR 0006](0006-retire-nativewind-gluestack.md), [docs/features/common.md](../features/common.md)

---

## 1. 맥락

YLMC Connect 디자인 시스템을 새로 정리했다(claude.ai 아티팩트 "YLMC Connect 디자인 시스템", 토큰 `version: 2`). 이 디자인 시스템은 디자인 캔버스와 같은 값을 쓰며, 토큰(`project/tokens.json`), 화면 규칙(`guidelines.md`), 움직임(`motion.md`), 문구(`copy.md`), 컴포넌트 41종의 규격을 담고 있다.

지금 앱의 토큰(`src/constants/designTokens.json`, `theme.ts`)과 비교하면 다음이 다르다.

- 색 이름 체계가 다르다(`ink`·`inkMute`·`primaryDeep`·`line` → `text`·`text-muted`·`primary-strong`·`border`). 회색은 반투명 rgba가 아니라 불투명 hex이고, 상태 색(`danger`·`success`·`warning`)은 더 진하다. `info/success/warning/danger`는 `*-subtle`·`*-icon`·`*-text` 세트로 쓴다.
- 글자 크기가 6단계(28·22·18·16·14·12)뿐이다. 앱은 9단계 이상을 쓰고, 숫자로 직접 쓴 크기도 많다.
- 모서리 이름은 같은데 값이 한 칸씩 밀려 있다(앱 `lg` 16 = 새 `md` 16).
- 카드는 테두리 없이 그림자(`shadow-sm`)만 쓴다. 앱은 테두리만 쓰고 그림자가 없다.
- 크기(`size`), 겹침 순서(`zIndex`), 투명도, 차트·아바타·썸네일 색이 새로 생겼다.

theme 토큰은 73개 파일에서 쓰이고, 화면에 직접 쓴 색이 96곳 있다. 모든 도메인에 걸치고 화면 전체의 모양을 바꾸는 변경이라 ADR로 남긴다.

---

## 2. 결정

### 2.1 기준과 이름

1. **디자인 시스템 아티팩트가 기준이다.** 앱에 없는 값이 필요하면 화면에서 만들지 않고 캔버스와 디자인 시스템에 먼저 추가한다.
2. **이름은 디자인 시스템 이름을 camelCase로 바꿔 쓴다.** `text-muted` → `textMuted`, `primary-strong` → `primaryStrong`, `space-4` → `spacing[4]`, `radius-full` → `radius.full`.
3. **`designTokens.json`은 디자인 시스템 `tokens.json`에서 스크립트로 만든다.** 디자인 시스템이 바뀌면 스크립트를 다시 돌린다.
4. **라이트 모드만 지원한다.** 다크 모드와 알림(NotificationItem)은 이번 범위가 아니다.

### 2.2 짝이 없는 옛 토큰

| 옛 토큰 | 옮기는 곳 |
|---|---|
| `inkSoft` / `textSecondary` | 쓰임새로 나눈다. 읽는 글·입력 라벨·취소 버튼 글자·아이콘 → `text`. 선택 안 된 칩·메타 정보 → `textMuted` |
| `surface2` | 입력창 → `surface` + `borderStrong`. 배지·안내 칸·취소 버튼·진행 막대 트랙 → `surfaceSubtle` |
| `inkHint` | 입력 안내(placeholder) → `textMuted`. 비활성 버튼 글자 → `textDisabled` |
| `lineStrong` | 입력창·스위치 같은 컨트롤 테두리 → `borderStrong`. Outline 버튼 → `borderButton`. 그 밖의 구분선 → `border` |
| `line`, `ring` | `border` |
| `primarySoft`, `primaryTint` | `primarySubtle`. 안내 박스 바탕이면 `infoSubtle` |
| `danger`, `success`, `warn` | 글자 → `*Text`, 아이콘 → `*Icon`. 위험 버튼 바탕 → `dangerBold` |
| `amberSoft` | `warningSubtle` |
| `sage` (아바타) | 이름으로 고르는 `avatar1~6` |
| `glass` | `barGlass` |
| `toast` | 토스트를 흰 바탕(`surface` + `shadow.lg`)으로 바꾼다 |
| `white` | 색 위 글자 → `onPrimary`. 바탕 → `surface` |
| `canvas`, `surfaceMuted`, `overlay` | `bg`, `surfaceSubtle`, `sheetOverlay` |
| `glassBorder`, `sageSoft`, `taupe`, `taupeSoft` | 지운다(쓰는 곳이 없거나 위로 흡수) |

### 2.3 글자

- 6단계를 그대로 쓴다: `display` 28/36, `title` 22/30, `heading` 18/26, `body` 16/24, `label` 14/20, `caption` 12/18.
- 본문은 15 → 16, 캡션(11·10·9)은 12로 올린다. 숫자로 쓴 13은 보조 본문·버튼이면 14(`label`), 메타 줄이면 12(`caption`).
- AppText 변형 이름: `screenTitle` → `title`, `sectionTitle` → `heading`, `cardTitle` → `body`(600), `formLabel` → `label`.

### 2.4 모서리·그림자·간격·움직임·아이콘

- 모서리는 **값 기준**으로 옮긴다: 앱 `sm` 10 → `sm` 12, `md` 14 → `md` 16, `lg` 16 → `md` 16, `xl` 20 → `lg` 20, `2xl` 28 → `xl` 28, `pill` → `full`. 이름이 겹치므로 별칭을 두지 않고 토큰 교체 PR에서 호출부를 한 번에 바꾼다.
- 카드는 테두리를 빼고 `shadow.sm`만 쓴다. Android는 elevation으로 비슷하게 맞춘다. 그림자는 `sm`·`md`·`lg`·`sheet` 네 가지이고, 목록에 없는 `primary`·`raised`·`fab`·`float`은 컴포넌트 PR에서 이 넷으로 옮기거나 뺀다.
- 간격은 4px 단위이며 `spacing[7]`(28)·`spacing[11]`(44)는 없어진다. 카드 안쪽 여백은 16이다.
- 움직임 속도는 `fast` 120, `base` 200, `slow` 300, `stagger` 60이다. `overlay` 220 → `base`, `enter` 280 → `slow`.
- 아이콘은 지금처럼 `AppIcon`을 통해 lucide를 쓰고, 기본 선 굵기를 2에서 1.5로 바꾼다. 쓰지 않는 `@expo/vector-icons`는 정리 PR에서 뺀다.

### 2.5 옮기는 순서

1. **토큰 교체**: 새 토큰을 넣고 1:1 짝이 있는 옛 이름은 새 값을 가리키는 별칭으로 남긴다. 쓰임새로 갈리는 이름(`inkSoft`, `surface2`, `lineStrong` 등)은 가장 가까운 새 값으로 임시로 둔다.
2. **공통 컴포넌트**: `src/components/ui/`를 디자인 시스템 규격(크기·상태·토큰)으로 맞춘다.
3. **도메인 화면**: 도메인마다 PR 하나로 옛 이름과 직접 쓴 색·글자 크기를 새 토큰으로 바꾸고 `copy.md` 문구를 맞춘다. 그 도메인에 필요한 새 컴포넌트는 같은 PR에서 만든다.
4. **정리**: 별칭을 지우고, 직접 쓴 색이 다시 생기지 않게 검사한다.
5. **접근성 점검**: 대비, 터치 영역 44, 아이콘 버튼 접근성 이름, 글자 확대, 동작 줄이기.

---

## 3. 결과

- **긍정적 영향**:
  - 캔버스·디자인 시스템·앱이 같은 이름과 값을 쓴다.
  - 글자가 커지고 상태 색이 진해져서 대비 기준(4.5:1)을 맞춘다.
  - 별칭을 거쳐 옮기므로 도메인 PR을 작게 나눌 수 있다.
- **부정적 영향 / 트레이드오프**:
  - 본문·캡션이 커져서 한 화면에 보이는 양이 조금 줄어든다.
  - 옮기는 동안에는 옛 이름과 새 이름이 함께 있다. 정리 PR 전까지는 새 코드에 새 이름만 쓴다.
  - 쓰임새로 갈리는 토큰은 도메인 PR에서 호출부마다 판단해야 한다.
