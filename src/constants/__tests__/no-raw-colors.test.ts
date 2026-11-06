import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

/**
 * 화면·부품 코드에 색 값을 직접 쓰지 않는다(디자인 시스템 v2, ADR 0007).
 * 색은 theme.colors 토큰으로만 쓴다. 디자인 시스템에 해당 토큰이 없는
 * 반투명 오버레이·그라데이션만 아래 목록에 사유와 개수를 적어 허용한다.
 */
const ALLOWED: Record<string, { count: number; reason: string }> = {
  "app/(auth)/splash.tsx": {
    count: 4,
    reason: "primary 바탕 위 반투명 흰 장식",
  },
  "app/(tabs)/_layout.tsx": { count: 2, reason: "탭바 뒤 흰 그라데이션 띠" },
  "app/(tabs)/index.tsx": { count: 2, reason: "파랑 카드·사진 위 반투명 배지" },
  "app/(tabs)/market/[id].tsx": {
    count: 6,
    reason: "사진 위 어두운 그라데이션",
  },
  "app/(tabs)/market/index.tsx": {
    count: 1,
    reason: "나눔완료 사진 어두운 덮개",
  },
  "src/components/faith/faithSectionsStyles.ts": {
    count: 1,
    reason: "사진 위 어두운 덮개",
  },
  "src/components/home/HomeHeroVisual.tsx": {
    count: 5,
    reason: "bg 반투명 그라데이션",
  },
  "src/components/market/detail/marketDetailStyles.ts": {
    count: 2,
    reason: "사진 점 표시·덮개",
  },
  "src/components/ui/display.tsx": {
    count: 18,
    reason: "VisualCover 장식 팔레트",
  },
  "src/components/ui/floating-bottom-bar.tsx": {
    count: 3,
    reason: "bg 반투명 그라데이션",
  },
  "src/components/ui/navigation.tsx": {
    count: 2,
    reason: "TopBar 사진 위 헤더 어두운 그라데이션",
  },
  "src/components/ui/photo-tile.tsx": {
    count: 1,
    reason: "사진 타일 지우기 원·대표 띠·업로드 덮개 60% 어두움",
  },
  "src/components/ui/screen-header.tsx": {
    count: 1,
    reason: "머리글 아래 가장자리 그라데이션 끝(bg 투명)",
  },
  "src/components/ui/share-card.tsx": {
    count: 2,
    reason: "나눔 사진 안쪽 1px 선·1/N 알약 반투명 바탕",
  },
};

const ROOT = join(__dirname, "../../..");
const COLOR = /#[0-9A-Fa-f]{3,8}\b|rgba?\(/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === "__tests__" || name === "constants"
        ? []
        : sourceFiles(path);
    }
    return /\.tsx?$/.test(name) && !name.endsWith(".d.ts") ? [path] : [];
  });
}

describe("no raw colors outside theme tokens", () => {
  const counts: Record<string, number> = Object.fromEntries(
    [...sourceFiles(join(ROOT, "app")), ...sourceFiles(join(ROOT, "src"))]
      .map((path): [string, number] => [
        relative(ROOT, path),
        readFileSync(path, "utf8").match(COLOR)?.length ?? 0,
      ])
      .filter(([, count]) => count > 0),
  );

  it("uses theme.colors instead of hex/rgba values", () => {
    const unexpected = Object.entries(counts).filter(
      ([file, count]) => count > (ALLOWED[file]?.count ?? 0),
    );
    expect(unexpected).toEqual([]);
  });

  it("keeps the allow list free of stale entries", () => {
    const stale = Object.keys(ALLOWED).filter(
      (file) => (counts[file] ?? 0) < ALLOWED[file].count,
    );
    expect(stale).toEqual([]);
  });
});
