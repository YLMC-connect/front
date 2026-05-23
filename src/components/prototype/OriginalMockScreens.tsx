import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../layout/Screen";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FloatingActionButton,
  HorizontalChips,
  RadioSheet,
  SegmentedTabs,
  TextField,
  Textarea,
  Toast,
  TopBar,
  VisualCover,
  VisualThumb,
} from "../ui";
import { theme } from "../../constants/theme";

type VariantValue = string | string[] | undefined;

export function variantOf(value: VariantValue, fallback = "default") {
  return Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
}

export function SplashReferenceScreen() {
  return (
    <View style={styles.splash}>
      <View style={styles.splashOrbTop} />
      <View style={styles.splashOrbBottom} />
      <View style={styles.splashLogo}>
        <MaterialIcons name="door-front" size={58} color="#fff" />
      </View>
      <Text style={styles.splashTitle}>열린문 커넥트</Text>
      <Text style={styles.splashSub}>성도와 성도, 마음과 마음을 이어요</Text>
      <View style={styles.splashDots}>
        <View style={[styles.dot, { opacity: 0.4 }]} />
        <View style={[styles.dot, { opacity: 0.6 }]} />
        <View style={[styles.dot, { opacity: 0.85 }]} />
      </View>
    </View>
  );
}

export function LoginReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen>
      <View style={styles.authHero}>
        <View style={styles.authLogo}>
          <MaterialIcons name="door-front" size={38} color="#fff" />
        </View>
        <Text style={styles.displayTitle}>열린문 커넥트</Text>
        <Text style={styles.bodyText}>
          성도와 성도를 이어주는 교회 커뮤니티
        </Text>
      </View>
      <Card style={styles.stack}>
        <TextField label="아이디" value="ylmc" />
        <TextField label="비밀번호" value="password" secureTextEntry />
        {variant === "error" ? (
          <Text style={styles.errorText}>
            아이디 또는 비밀번호가 올바르지 않습니다
          </Text>
        ) : null}
        <Button loading={variant === "loading"}>로그인</Button>
        <Button variant="soft">회원가입</Button>
      </Card>
      <Toast
        message={
          variant === "toast"
            ? "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요."
            : ""
        }
      />
    </Screen>
  );
}

export function InviteCodeReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen>
      <TopBar title="가입 코드" back onBack={() => router.back()} />
      <View style={styles.displayBlock}>
        <Text style={styles.displayTitle}>
          교회에서 받은 코드를 입력해주세요
        </Text>
        <Text style={styles.bodyText}>
          열린문교회 성도 확인 후 회원가입을 이어갑니다.
        </Text>
      </View>
      <Card style={styles.stack}>
        <TextField
          label="가입 코드"
          value={variant === "error" ? "YLMC-0000" : "YLMC-2026"}
          error={
            variant === "error" ? "유효하지 않은 가입 코드입니다" : undefined
          }
        />
        <Button loading={variant === "loading"}>확인</Button>
      </Card>
      <Toast
        message={
          variant === "toast"
            ? "네트워크가 불안정합니다. 잠시 후 다시 시도해주세요."
            : ""
        }
      />
    </Screen>
  );
}

export function TermsReferenceScreen({ sheet = false }: { sheet?: boolean }) {
  return (
    <Screen>
      <TopBar
        title={sheet ? "약관 전문" : "약관 동의"}
        back
        onBack={() => router.back()}
      />
      <View style={styles.displayBlock}>
        <Text style={styles.displayTitle}>
          {sheet ? "서비스 이용약관" : "이용 전 약관에 동의해주세요"}
        </Text>
        <Text style={styles.bodyText}>
          성도 간 안전한 연결을 위해 필수 약관과 개인정보 처리방침을 확인합니다.
        </Text>
      </View>
      {sheet ? (
        <Card style={styles.stack}>
          {legalParagraphs.map((text) => (
            <Text key={text} style={styles.bodyText}>
              {text}
            </Text>
          ))}
        </Card>
      ) : (
        <Card style={styles.menuCard}>
          <MenuRow
            icon="check-circle"
            title="서비스 이용약관 동의"
            value="필수"
          />
          <MenuRow
            icon="verified-user"
            title="개인정보 처리방침 동의"
            value="필수"
          />
          <MenuRow
            icon="campaign"
            title="교회 소식 수신 동의"
            value="선택"
            last
          />
        </Card>
      )}
      {!sheet ? <Button>동의하고 계속</Button> : null}
    </Screen>
  );
}

export function SignupReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen>
      <TopBar title="회원가입" back onBack={() => router.back()} />
      <View style={styles.displayBlock}>
        <Text style={styles.displayTitle}>교회 성도 정보를 입력해주세요</Text>
        <Text style={styles.bodyText}>
          관리자 확인 후 목장 정보가 자동 연결됩니다.
        </Text>
      </View>
      <Card style={styles.stack}>
        <TextField
          label="아이디"
          value="ylmc2026"
          error={
            variant === "id-dup" ? "이미 사용 중인 아이디입니다" : undefined
          }
        />
        <TextField
          label="비밀번호"
          value="spring2026!"
          secureTextEntry
          error={
            variant === "pw-error"
              ? "비밀번호는 영문/숫자 조합 8자 이상입니다"
              : undefined
          }
        />
        <TextField label="이름" value="김은혜" />
        <TextField
          label="연락처"
          value={variant === "phone-error" ? "010-12" : "010-2345-6789"}
          keyboardType="phone-pad"
          error={
            variant === "phone-error"
              ? "연락처 형식이 올바르지 않습니다"
              : variant === "phone-dup"
                ? "이미 등록된 연락처입니다"
                : undefined
          }
        />
        <TextField label="이메일 선택" value="eunhye@example.com" />
        <Button loading={variant === "loading"}>가입 완료</Button>
      </Card>
    </Screen>
  );
}

export function NotificationsReferenceScreen() {
  return (
    <Screen>
      <TopBar title="알림" back onBack={() => router.back()} />
      <View style={styles.stack}>
        {[
          [
            "event-note",
            "이번 주 공지",
            "주일 2부 예배 시간이 변경되었습니다.",
            "방금",
          ],
          [
            "redeem",
            "나눔 댓글",
            "아이 장난감 나눔에 새 댓글이 달렸습니다.",
            "12분 전",
          ],
          [
            "groups",
            "소모임 공지",
            "토요 산악회 장소가 업데이트되었습니다.",
            "1시간 전",
          ],
        ].map(([icon, title, body, time]) => (
          <Card key={title} style={styles.rowCard}>
            <View style={styles.softIcon}>
              <MaterialIcons
                name={icon as keyof typeof MaterialIcons.glyphMap}
                size={22}
                color={theme.colors.primaryDeep}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.bodyText}>{body}</Text>
              <Text style={styles.metaText}>{time}</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

export function HomeReferenceScreen() {
  const myGroups = [
    {
      name: "청년 1부 큐티모임",
      last: "오늘 09:14",
      msg: "마가복음 8장 함께 묵상해요",
    },
    {
      name: "토요 산악회",
      last: "어제 18:02",
      msg: "이번 주 청계산 사진 올렸어요",
    },
    {
      name: "주방 봉사팀",
      last: "2일 전",
      msg: "다음 주 메뉴 회의 잡았어요",
    },
  ];
  const newGroups = [
    { name: "사진 동아리", cat: "문화", n: 8 },
    { name: "성가대 신입", cat: "봉사", n: 5 },
    { name: "아빠와 산책", cat: "가족", n: 12 },
  ];
  const market = [
    { title: "유아용 그림책 30권", price: "무료" },
    { title: "에어프라이어", price: "25,000원" },
    { title: "유모차", price: "무료" },
    { title: "캠핑 의자 2개", price: "15,000원" },
  ];

  return (
    <Screen padded={false}>
      <View testID="screen-home" style={styles.homeHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <MaterialIcons name="door-front" size={19} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>열린문 커넥트</Text>
        </View>
        <View style={styles.headerActions}>
          <MaterialIcons name="search" size={22} color={theme.colors.inkSoft} />
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={theme.colors.inkSoft}
          />
          <View style={styles.noticeDot} />
        </View>
      </View>

      <View style={styles.contentPad}>
        <Card style={styles.noticeBanner}>
          <View style={styles.noticeIcon}>
            <MaterialIcons name="event" size={23} color="#fff" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.noticeEyebrow}>이번 주 공지</Text>
            <Text style={styles.noticeHeadline}>
              주일 2부 예배 시간 변경 안내
            </Text>
          </View>
          <View style={styles.noticePagers}>
            <View style={[styles.noticePager, styles.noticePagerActive]} />
            <View style={styles.noticePager} />
            <View style={styles.noticePager} />
          </View>
        </Card>
      </View>

      <Section
        title="내 소모임 활동"
        trailing={<Text style={styles.moreText}>전체보기 ›</Text>}
      >
        <View style={styles.rail}>
          {myGroups.map((group, index) => (
            <Card key={group.name} style={styles.homeGroupCard}>
              <VisualCover height={84} seed={index} />
              <Text numberOfLines={1} style={styles.cardTitle}>
                {group.name}
              </Text>
              <Text numberOfLines={1} style={styles.metaText}>
                {group.msg}
              </Text>
              <Text style={styles.metaText}>{group.last}</Text>
            </Card>
          ))}
        </View>
      </Section>

      <View style={styles.statsGrid}>
        <Card style={styles.statPanel}>
          <Text style={styles.metaText}>오늘 기도제목</Text>
          <Text style={styles.statNumber}>
            12 <Text style={styles.statUnit}>개</Text>
          </Text>
          <Text style={styles.metaText}>월요 새벽기도방</Text>
        </Card>
        <Card style={[styles.statPanel, styles.statWarm]}>
          <Text style={[styles.metaText, styles.warmText]}>
            이번 주 기도응답
          </Text>
          <Text style={[styles.statNumber, styles.warmText]}>
            7 <Text style={styles.statUnit}>건</Text>
          </Text>
          <Text style={[styles.metaText, styles.warmText]}>지난주 대비 +3</Text>
        </Card>
      </View>

      <Section
        title="새로 생긴 소모임"
        trailing={<Text style={styles.moreText}>더보기 ›</Text>}
      >
        <View style={styles.smallRail}>
          {newGroups.map((group, index) => (
            <View key={group.name} style={styles.newGroupTile}>
              <VisualCover height={150} seed={index + 2} />
              <Text numberOfLines={1} style={styles.cardTitle}>
                {group.name}
              </Text>
              <View style={styles.inlineMeta}>
                <Badge>{group.cat}</Badge>
                <Text style={styles.metaText}>멤버 {group.n}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="최근 나눔 물품"
        trailing={<Text style={styles.moreText}>전체보기 ›</Text>}
      >
        <View style={styles.marketGrid}>
          {market.map((item, index) => (
            <View key={item.title}>
              <VisualThumb size={150} seed={index} />
              <Text numberOfLines={1} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.priceText,
                  item.price === "무료" ? styles.primaryText : null,
                ]}
              >
                {item.price}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
}

export function MarketListReferenceScreen({ variant }: { variant: string }) {
  const active =
    variant === "tab-all"
      ? "all"
      : variant === "tab-reserved"
        ? "reserved"
        : variant === "tab-done"
          ? "done"
          : "sharing";
  const isError = variant === "network-error";
  const list =
    isError || variant === "empty"
      ? []
      : active === "all"
        ? marketPosts
        : marketPosts.filter((post) => post.status === active);

  return (
    <Screen padded={false}>
      <TopBar testID="screen-market" title="나눔" />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={marketStatusTabs}
          active={active}
          onChange={() => undefined}
        />
      </View>
      <HorizontalChips
        items={marketCategories}
        active="all"
        onChange={() => undefined}
      />
      <View style={styles.routeList}>
        {isError ? (
          <ErrorState />
        ) : list.length === 0 ? (
          <EmptyState
            title={
              active === "reserved"
                ? "예약중인 나눔이 없어요"
                : active === "done"
                  ? "아직 완료된 나눔이 없어요"
                  : "진행 중인 나눔이 없어요"
            }
            description="첫 나눔을 시작해보세요."
            icon="redeem"
          />
        ) : (
          list.map((post, index) => (
            <Card key={post.title} style={styles.marketRow}>
              <View style={styles.thumbWrap}>
                <VisualThumb size={86} seed={index} />
                {post.status !== "sharing" ? (
                  <View style={styles.thumbBadge}>
                    <Text style={styles.thumbBadgeText}>
                      {post.status === "reserved" ? "예약중" : "나눔완료"}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{post.title}</Text>
                <Text style={styles.metaText}>
                  {post.author} · {post.when}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>
      <FloatingActionButton label="글쓰기" />
    </Screen>
  );
}

export function MarketDetailReferenceScreen({ variant }: { variant: string }) {
  if (variant === "deleted" || variant === "blocked") {
    return (
      <Screen>
        <TopBar title="나눔 상세" back onBack={() => router.back()} />
        <EmptyState
          title={
            variant === "deleted"
              ? "삭제된 게시글입니다"
              : "차단한 사용자의 글입니다"
          }
          description="목록에서 다른 나눔을 확인해주세요."
          icon={variant === "deleted" ? "delete-outline" : "block"}
        />
      </Screen>
    );
  }

  const status =
    variant === "own-reserved"
      ? "reserved"
      : variant === "own-done"
        ? "done"
        : "sharing";
  const isReserved = status === "reserved";
  const isDone = status === "done";
  const isOwn =
    variant.startsWith("own") ||
    variant === "status" ||
    variant === "delete-confirm";
  const showReport = variant === "report" || variant === "report-other-input";

  return (
    <Screen padded={false}>
      <View style={styles.marketHero}>
        <VisualCover height={360} seed={2} style={styles.marketHeroCover} />
        <View style={styles.marketHeroScrim} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.overlayBack}
        >
          <MaterialIcons
            name="chevron-left"
            size={21}
            color={theme.colors.ink}
          />
          <Text style={styles.overlayBackText}>뒤로</Text>
        </Pressable>
        {isReserved || isDone ? (
          <View
            style={
              isReserved
                ? styles.marketHeroReservedCenter
                : styles.marketHeroDoneCenter
            }
          >
            <View
              style={[
                styles.marketHeroStatus,
                isReserved ? styles.marketHeroReserved : styles.marketHeroDone,
              ]}
            >
              <Text
                style={[
                  styles.marketHeroStatusText,
                  isReserved ? styles.marketHeroReservedText : null,
                ]}
              >
                {isReserved ? "예약중" : "나눔완료"}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.heroPager}>
          <View style={styles.heroPagerActive} />
          <View style={styles.heroPagerDot} />
          <View style={styles.heroPagerDot} />
        </View>
      </View>

      {isReserved ? (
        <StatusBanner
          icon="schedule"
          tone="warn"
          title="예약중인 나눔입니다"
          description="다른 분과 수령 약속이 진행 중이에요"
        />
      ) : null}
      {isDone ? (
        <StatusBanner
          icon="check"
          title="나눔이 완료되었습니다"
          description="이 게시글은 더 이상 신청할 수 없어요"
        />
      ) : null}

      <View style={isDone ? styles.faded : null}>
        <View style={styles.marketAuthorBlock}>
          <Avatar name={isOwn ? "김은혜" : "박정아"} />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{isOwn ? "김은혜" : "박정아"}</Text>
            <Text style={styles.metaText}>1시간 전</Text>
          </View>
        </View>
        <View style={styles.marketDetailContent}>
          <View style={styles.inlineMeta}>
            <Chip label="유아·아동용품" selected />
            <Chip label="사용감 있음" />
          </View>
          <Text style={styles.titleText}>
            아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)
          </Text>
        </View>
        <Text style={styles.marketBody}>
          아이가 커서 더 이상 쓰지 않는 장난감 정리해요.{"\n"}
          대부분 깨끗하게 사용한 것들이고, 블록류 20점 + 인형류 10점 정도
          됩니다.{"\n"}
          필요하신 분께 무료로 드려요!{"\n\n"}
          수령은 토요일 오후 교회 1층 로비에서 가능합니다.{"\n"}한 분께 일괄로
          드리려고 합니다.
        </Text>
        <Card style={styles.detailActionCard}>
          {isOwn && !isDone ? (
            <>
              <DetailAction icon="edit" label="수정" />
              <DetailAction icon="delete-outline" label="삭제" danger />
              <DetailAction icon="sync" label="상태 변경" />
            </>
          ) : null}
          {isOwn && isDone ? (
            <DetailAction icon="delete-outline" label="삭제" danger full />
          ) : null}
          {!isOwn ? (
            <>
              <DetailAction icon="flag" label="신고" />
              <DetailAction icon="block" label="차단" danger />
            </>
          ) : null}
        </Card>
        <Card style={styles.stack}>
          <Text style={styles.cardTitle}>댓글 2</Text>
          <Text style={styles.bodyText}>
            오늘 저녁 예배 후 받을 수 있을까요?
          </Text>
          <Textarea
            value={
              variant === "composer-multiline"
                ? "오늘 예배 후\n로비에서 뵙겠습니다."
                : ""
            }
            placeholder="나눔 받을 수 있는 시간을 남겨주세요."
          />
          <Button>댓글 등록</Button>
        </Card>
      </View>
      <RadioSheet
        visible={variant === "status"}
        title="상태 변경"
        value="sharing"
        options={[
          { value: "sharing", label: "나눔중", disabled: true },
          { value: "reserved", label: "예약중" },
          { value: "done", label: "나눔완료" },
        ]}
        hint="상태는 되돌릴 수 없습니다 (나눔중 → 예약중 → 나눔완료)"
        onClose={() => undefined}
        onConfirm={() => undefined}
      />
      <RadioSheet
        visible={showReport}
        title="신고"
        value={variant === "report-other-input" ? "기타" : "허위 물품 정보"}
        options={marketReportReasons.map((reason) => ({
          value: reason,
          label: reason,
        }))}
        confirmText="신고하기"
        danger
        hint="허위·악의적 신고 시 이용이 제한될 수 있습니다."
        onClose={() => undefined}
        onConfirm={() => undefined}
      >
        {variant === "report-other-input" ? (
          <View style={styles.sheetField}>
            <Textarea value="홍보성 글 같아요. 같은 사진을 여러 번 올리는 것 같습니다." />
          </View>
        ) : null}
      </RadioSheet>
      <ConfirmDialog
        visible={variant === "delete-confirm"}
        title="게시글을 삭제하시겠습니까?"
        message="삭제하면 댓글을 포함한 모든 내용이 사라지며 복구할 수 없어요."
        confirmText="삭제"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={
          variant === "report-dup-toast" ? "이미 신고한 게시글입니다." : ""
        }
      />
    </Screen>
  );
}

export function MarketCreateReferenceScreen({ variant }: { variant: string }) {
  const filled = variant === "create-filled" || variant === "edit";
  return (
    <Screen>
      <TopBar
        title={variant === "edit" ? "나눔 글 수정" : "나눔 글쓰기"}
        subtitle="무료 나눔만 등록할 수 있습니다"
        back
        onBack={() => router.back()}
      />
      <Card style={styles.stack}>
        <TextField
          label="제목"
          value={filled ? "아이 장난감 정리하면서 나눔합니다" : ""}
        />
        <Textarea
          label="설명"
          value={filled ? "블록과 인형 30점을 한 번에 나눔합니다." : ""}
        />
        <TextField label="물품 상태" value={filled ? "사용감 적음" : ""} />
        <TextField label="전달 장소" value="본당 1층 로비" />
        <Button>{variant === "edit" ? "수정" : "등록"}</Button>
      </Card>
      <ConfirmDialog
        visible={variant === "back-warn"}
        title="작성을 그만할까요?"
        message="입력한 내용이 저장되지 않습니다."
        confirmText="나가기"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={
          variant === "limit-toast"
            ? "사진은 최대 5장까지 등록할 수 있습니다."
            : ""
        }
      />
    </Screen>
  );
}

export function GroupListReferenceScreen({ variant }: { variant: string }) {
  const isMine = variant === "mine" || variant === "mine-empty";
  const isError = variant === "network-error";
  const list =
    isError || variant === "mine-empty"
      ? []
      : isMine
        ? groupItems.slice(0, 3)
        : groupItems;

  return (
    <Screen padded={false}>
      <TopBar testID="screen-group" title="소모임" />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={groupTabs}
          active={isMine ? "mine" : "all"}
          onChange={() => undefined}
        />
      </View>
      <HorizontalChips
        items={groupCategories}
        active="all"
        onChange={() => undefined}
      />
      <View style={styles.routeList}>
        {isError ? (
          <ErrorState />
        ) : list.length === 0 ? (
          <EmptyState
            title="참여 중인 소모임이 없습니다"
            description="관심 가는 소모임을 찾아 함께할 친구들을 만나보세요."
            icon="groups"
          />
        ) : (
          list.map((group) => (
            <Card key={group.name} style={styles.stack}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{group.name}</Text>
                <Badge tone={group.closed ? "mute" : "success"}>
                  {group.closed ? "모집완료" : "모집중"}
                </Badge>
              </View>
              <Badge tone="primary">{group.category}</Badge>
              <Text style={styles.bodyText}>{group.description}</Text>
              <Text style={styles.metaText}>
                현재 {group.count} / 최대 {group.max}
              </Text>
            </Card>
          ))
        )}
      </View>
      <FloatingActionButton label="개설" />
    </Screen>
  );
}

export function GroupDetailReferenceScreen({ variant }: { variant: string }) {
  if (variant === "deleted-exception") {
    return (
      <Screen>
        <TopBar title="소모임 상세" back onBack={() => router.back()} />
        <EmptyState
          title="존재하지 않는 소모임입니다"
          description="삭제되었거나 더 이상 접근할 수 없는 소모임이에요."
          icon="error-outline"
        />
      </Screen>
    );
  }

  const isLeader =
    variant === "leader" ||
    variant === "leader-closed" ||
    variant === "delete-confirm";
  const isClosed = variant === "leader-closed" || variant === "non-closed";
  const isMember = variant === "member" || variant === "leave-confirm";
  const members = [
    isLeader ? "김은혜" : "한지수",
    "박정아",
    "이수진",
    "김지영",
    "정혜진",
    "조미경",
  ];

  return (
    <Screen padded={false}>
      <View style={styles.detailTopPad}>
        <TopBar title="소모임" back onBack={() => router.back()} />
      </View>
      <View style={styles.groupDetailHeader}>
        <View style={styles.inlineMeta}>
          <Chip label="운동" selected />
          <Badge tone={isClosed ? "mute" : "success"}>
            {isClosed ? "모집완료" : "모집중"}
          </Badge>
        </View>
        <Text style={styles.groupDetailTitle}>토요 산악회</Text>
        <Text style={styles.groupMetaText}>
          현재 <Text style={styles.primaryText}>{isClosed ? 25 : 18}</Text> /
          최대 25
        </Text>
        <Text style={styles.bodyText}>
          매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.
          {"\n"}
          등산 초보도 환영해요. 등산화·물·간식만 챙겨오시면 돼요.{"\n"}
          모임 일정과 코스는 매주 화요일 공지로 안내드립니다.
        </Text>
        <Card style={styles.groupLeaderCard}>
          <Avatar name={isLeader ? "김은혜" : "한지수"} />
          <View style={styles.flex}>
            <Text style={styles.metaText}>소모임장</Text>
            <Text style={styles.cardTitle}>
              {isLeader ? "김은혜" : "한지수"}
            </Text>
          </View>
          <Badge>소모임장</Badge>
        </Card>
      </View>
      <View style={styles.groupActionWrap}>
        {isLeader ? (
          <Card style={styles.detailActionCard}>
            <DetailAction icon="edit" label="수정" />
            <DetailAction icon="campaign" label="공지" />
            <DetailAction icon="groups" label="멤버" />
            <DetailAction icon="delete-outline" label="삭제" danger />
          </Card>
        ) : isMember ? (
          <Button variant="ghost">탈퇴하기</Button>
        ) : (
          <Button disabled={isClosed}>
            {isClosed ? "모집이 마감됐어요" : "참여 신청하기"}
          </Button>
        )}
      </View>
      <Section title={`멤버 ${members.length}명`}>
        <View style={styles.memberRail}>
          {members.map((member, index) => (
            <View key={member} style={styles.memberMini}>
              <View style={styles.memberAvatarWrap}>
                <Avatar name={member} />
                {index === 0 ? (
                  <View style={styles.memberLeaderMark}>
                    <MaterialIcons name="star" size={10} color="#fff" />
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.memberMiniName}>
                {member}
              </Text>
            </View>
          ))}
        </View>
      </Section>
      <Section title="공지사항">
        <View style={styles.groupNoticeList}>
          <Card style={styles.stack}>
            <Text style={styles.cardTitle}>5월 18일 토요일 모임 안내</Text>
            <Text style={styles.bodyText}>
              이번 주 토요일은 북한산 도선사 코스로 갑니다. 오전 7시 교회 앞에서
              모입니다.
            </Text>
            <Text style={styles.metaText}>2일 전</Text>
          </Card>
          <Card style={styles.stack}>
            <Text style={styles.cardTitle}>신규 멤버 환영합니다</Text>
            <Text style={styles.bodyText}>
              이번 달에 새로 합류해주신 분들 진심으로 환영해요.
            </Text>
            <Text style={styles.metaText}>1주 전 · 수정됨</Text>
          </Card>
        </View>
      </Section>
      <ConfirmDialog
        visible={variant === "apply-confirm"}
        title="참여 신청하시겠습니까?"
        message="신청 즉시 소모임에 가입됩니다."
        confirmText="신청"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <ConfirmDialog
        visible={variant === "leave-confirm"}
        title="탈퇴하시겠습니까?"
        message="다시 참여하려면 신청을 새로 해야 해요."
        confirmText="탈퇴"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <ConfirmDialog
        visible={variant === "delete-confirm"}
        title="소모임을 삭제하시겠습니까?"
        message={
          "소모임을 삭제하면 모든 멤버가 퇴장됩니다.\n이 작업은 되돌릴 수 없어요."
        }
        confirmText="삭제"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={
          variant === "full-toast"
            ? "정원이 가득 찬 소모임입니다."
            : variant === "leader-leave-toast"
              ? "소모임장은 바로 탈퇴할 수 없습니다."
              : ""
        }
      />
    </Screen>
  );
}

export function GroupCreateReferenceScreen({ variant }: { variant: string }) {
  const filled = variant === "create-filled" || variant === "edit";
  return (
    <Screen>
      <TopBar
        title={variant === "edit" ? "소모임 수정" : "소모임 개설"}
        subtitle="봉사와 카풀도 소모임으로 운영합니다"
        back
        onBack={() => router.back()}
      />
      <Card style={styles.stack}>
        <TextField label="소모임명" value={filled ? "토요 산악회" : ""} />
        <Textarea
          label="설명"
          value={filled ? "매주 토요일 함께 산을 오릅니다." : ""}
        />
        <TextField
          label="최대 인원"
          value={
            variant === "range-error"
              ? "1"
              : variant === "member-error"
                ? "10"
                : "25"
          }
          keyboardType="number-pad"
          error={
            variant === "range-error"
              ? "최대 인원은 2명 이상이어야 합니다"
              : variant === "member-error"
                ? "현재 멤버 수보다 적게 설정할 수 없습니다"
                : undefined
          }
        />
        <TextField label="일정" value={filled ? "매주 토요일 오전 7시" : ""} />
        <TextField label="장소" value={filled ? "교회 정문" : ""} />
        <Button>{variant === "edit" ? "수정" : "개설"}</Button>
      </Card>
    </Screen>
  );
}

export function GroupNoticeReferenceScreen({ variant }: { variant: string }) {
  const isEdit = variant === "edit";
  const isFilled = variant === "create-filled" || isEdit;
  return (
    <Screen>
      <TopBar
        title={isEdit ? "공지 수정" : "공지 작성"}
        back
        onBack={() => router.back()}
      />
      <Card style={styles.stack}>
        <TextField
          label="제목"
          value={isFilled ? "5월 18일 토요일 모임 안내" : ""}
        />
        <Textarea
          label="내용"
          value={
            isFilled ? "이번 주 토요일은 북한산 도선사 코스로 갑니다." : ""
          }
        />
        <Button>{isEdit ? "수정하기" : "등록하기"}</Button>
        {isEdit ? <Button variant="ghost">삭제</Button> : null}
      </Card>
      <ConfirmDialog
        visible={variant === "delete-confirm"}
        title="공지를 삭제할까요?"
        message="삭제된 공지는 다시 복구할 수 없습니다."
        confirmText="삭제"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    </Screen>
  );
}

export function GroupMembersReferenceScreen({ variant }: { variant: string }) {
  const isTransfer = variant === "transfer" || variant === "transfer-confirm";
  const members = [
    { name: "김은혜", leader: true, joined: "2024.03.12", me: true },
    { name: "박정아", joined: "2024.04.02" },
    { name: "이수진", joined: "2024.05.18" },
    { name: "김지영", joined: "2024.07.21" },
    { name: "정혜진", joined: "2024.09.04" },
    { name: "조미경", joined: "2024.11.10" },
    { name: "한유라", joined: "2025.01.22" },
    { name: "강민서", joined: "2025.03.05" },
  ];

  return (
    <Screen padded={false}>
      <View style={styles.detailTopPad}>
        <TopBar
          title={isTransfer ? "소모임장 이관" : "멤버 관리"}
          back
          onBack={() => router.back()}
        />
      </View>
      {isTransfer ? (
        <View style={styles.transferWarning}>
          <MaterialIcons name="warning-amber" size={17} color="#A8643F" />
          <Text style={styles.transferWarningText}>
            이관 후에는 일반 멤버로 변경되며 권한이 즉시 사라집니다.
          </Text>
        </View>
      ) : (
        <Text style={styles.memberCountText}>전체 {members.length}명</Text>
      )}
      <View style={styles.memberList}>
        {members.map((member, index) => (
          <GroupMemberRow
            key={member.name}
            member={member}
            transferMode={isTransfer}
            selected={isTransfer && member.name === "박정아"}
            last={index === members.length - 1}
          />
        ))}
      </View>
      {isTransfer ? (
        <View style={styles.fixedBottomAction}>
          <Button>이관하기</Button>
        </View>
      ) : null}
      <ConfirmDialog
        visible={variant === "kick-confirm" || variant === "transfer-confirm"}
        title={
          variant === "transfer-confirm"
            ? "박정아님께 소모임장을 이관할까요?"
            : "이수진님을 강퇴하시겠습니까?"
        }
        message={
          variant === "transfer-confirm"
            ? "이관 즉시 본인은 일반 멤버로 변경되며 되돌릴 수 없습니다."
            : "강퇴된 멤버는 다시 신청할 수 없어요."
        }
        confirmText={variant === "transfer-confirm" ? "이관" : "강퇴"}
        danger={variant === "kick-confirm"}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={variant === "kick-toast" ? "이수진님이 강퇴되었습니다" : ""}
      />
    </Screen>
  );
}

function GroupMemberRow({
  member,
  transferMode,
  selected,
  last,
}: {
  member: { name: string; joined: string; leader?: boolean; me?: boolean };
  transferMode: boolean;
  selected: boolean;
  last: boolean;
}) {
  const selectable = transferMode && !member.leader;
  return (
    <View
      style={[
        styles.groupMemberRow,
        selected ? styles.groupMemberRowSelected : null,
        transferMode && member.leader ? styles.groupMemberRowDisabled : null,
        last ? styles.noBorder : null,
      ]}
    >
      {selectable ? (
        <View
          style={[
            styles.memberRadioMark,
            selected ? styles.memberRadioMarkSelected : null,
          ]}
        >
          {selected ? <View style={styles.memberRadioDot} /> : null}
        </View>
      ) : null}
      <Avatar name={member.name} size={42} />
      <View style={styles.flex}>
        <View style={styles.memberNameRow}>
          <Text style={styles.cardTitle}>{member.name}</Text>
          {member.me ? <Text style={styles.memberMeText}>(나)</Text> : null}
          {member.leader ? <Badge>소모임장</Badge> : null}
        </View>
        <Text style={styles.metaText}>{member.joined} 가입</Text>
      </View>
      {!transferMode && !member.leader ? (
        <View style={styles.kickPill}>
          <MaterialIcons name="close" size={12} color={theme.colors.danger} />
          <Text style={styles.kickPillText}>강퇴</Text>
        </View>
      ) : null}
    </View>
  );
}

const prayerRooms = [
  { day: "월", name: "월요 새벽기도방", n: 12, role: "리더" },
  { day: "수", name: "수요 가정 중보팀", n: 7, role: "멤버" },
  { day: "화", name: "화요 자녀 중보방", n: 24 },
  { day: "목", name: "목요 직장 중보팀", n: 18 },
] as const;

export function PrayerListReferenceScreen() {
  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-prayer"
        title="동행"
        subtitle="기도로 동행하고, 말씀으로 자라가요"
        right={
          <MaterialIcons name="search" size={22} color={theme.colors.inkSoft} />
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={[
            { key: "pray", label: "중보기도" },
            { key: "study", label: "삶공부" },
          ]}
          active="pray"
          onChange={() => undefined}
        />
      </View>
      <View style={styles.contentPad}>
        <Section title="내 기도모임방">
          <View style={styles.stack}>
            {prayerRooms.slice(0, 2).map((room, index) => (
              <Card key={room.name} style={styles.prayerRoomCard}>
                <View style={[styles.dayBox, dayBoxStyle(index)]}>
                  <Text style={[styles.dayText, dayTextStyle(index)]}>
                    {room.day}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <View style={styles.inlineMeta}>
                    <Text style={styles.cardTitle}>{room.name}</Text>
                    {"role" in room && room.role === "리더" ? (
                      <Badge tone="warn">리더</Badge>
                    ) : null}
                  </View>
                  <Text style={styles.metaText}>
                    오늘 새 기도제목 {room.n}개
                  </Text>
                </View>
                <Badge>{room.n}</Badge>
              </Card>
            ))}
          </View>
        </Section>
        <Section title="다른 기도모임방">
          <Card style={styles.menuCard}>
            {prayerRooms.slice(2).map((room, index) => (
              <View key={room.name} style={styles.menuRow}>
                <View style={[styles.smallDayBox, dayBoxStyle(index + 2)]}>
                  <Text style={[styles.smallDayText, dayTextStyle(index + 2)]}>
                    {room.day}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.menuTitle}>{room.name}</Text>
                  <Text style={styles.metaText}>멤버 {room.n}명</Text>
                </View>
                <Button variant="soft">참여</Button>
              </View>
            ))}
          </Card>
        </Section>
      </View>
      <FloatingActionButton compact icon="add" />
    </Screen>
  );
}

export function PrayerDetailReferenceScreen() {
  const names = ["박은정", "김도현", "이수민", "정혜린", "한지영"];
  const live = [
    "어머니 수술이 잘 끝나도록, 회복도 빠르도록 기도 부탁드려요.",
    "팀 안에서 갈등이 있어요. 지혜로 풀어가게 해주세요.",
    "아이 학교 적응을 위해 함께 기도해요.",
  ];
  const done = [
    "면접 결과 합격했어요! 함께 기도해주셔서 감사해요.",
    "건강검진 결과 깨끗하게 나왔습니다.",
  ];

  return (
    <Screen padded={false}>
      <TopBar
        title="월요 새벽기도방"
        back
        onBack={() => router.back()}
        right={
          <MaterialIcons
            name="notifications-none"
            size={22}
            color={theme.colors.inkSoft}
          />
        }
      />
      <View style={styles.detailMetaRow}>
        <Badge tone="warn">매주 월</Badge>
        <Text style={styles.metaText}>멤버 12 · 오늘 새 기도제목 3개</Text>
      </View>
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={[
            { key: "live", label: "기도중 3" },
            { key: "done", label: "응답 2" },
          ]}
          active="live"
          onChange={() => undefined}
        />
      </View>
      <View style={styles.contentPad}>
        {[...live, ...done].map((message, index) => {
          const answered = index >= live.length;

          return (
            <Card
              key={message}
              style={[styles.prayerCard, answered ? styles.faded : null]}
            >
              <View style={styles.authorRow}>
                <Avatar name={names[index]} size={30} />
                <View style={styles.flex}>
                  <Text style={styles.menuTitle}>{names[index]}</Text>
                  <Text style={styles.metaText}>
                    {index < 2 ? "오늘" : "어제"}
                  </Text>
                </View>
                <Badge tone={answered ? "mute" : "primary"}>
                  {answered ? "응답" : "기도중"}
                </Badge>
              </View>
              <Text style={styles.bodyText}>{message}</Text>
              <View style={styles.inlineMeta}>
                <Button variant="soft" icon="favorite-border">
                  함께 기도 {answered ? 22 : 14}
                </Button>
                {!answered ? <Button variant="ghost">응답완료</Button> : null}
              </View>
            </Card>
          );
        })}
      </View>
      <FloatingActionButton compact icon="add" />
    </Screen>
  );
}

export function PrayerApplyReferenceScreen() {
  return (
    <Screen>
      <TopBar title="기도방 신청" back onBack={() => router.back()} />
      <Card style={styles.stack}>
        <Text style={styles.displayTitle}>월요 새벽기도방</Text>
        <Text style={styles.bodyText}>
          매주 월요일 새벽, 가정과 교회를 위해 함께 기도합니다.
        </Text>
        <InfoRow label="요일" value="월요일" />
        <InfoRow label="멤버" value="12명" />
        <Button>참여 신청</Button>
      </Card>
    </Screen>
  );
}

export function PrayerRequestReferenceScreen() {
  return (
    <Screen>
      <TopBar title="기도요청" back onBack={() => router.back()} />
      <Card style={styles.stack}>
        <TextField label="이름" value="김은혜" />
        <TextField label="연락처" value="010-1234-5678" />
        <Textarea
          label="기도 제목"
          value="어머니 수술과 회복을 위해 기도 부탁드립니다."
        />
        <Button>기도 요청 보내기</Button>
      </Card>
    </Screen>
  );
}

const studyOpenCourses = [
  {
    name: "새가족반",
    status: "신청가능",
    term: "2025.05 ~ 06 · 6주",
    desc: "교회 첫걸음, 함께 시작해요",
  },
  {
    name: "제자훈련 1단계",
    status: "진행중",
    term: "2025.03 ~ 08 · 진도 4/12",
    desc: "예수님의 제자로 살아가기",
    progress: 33,
  },
  {
    name: "성경통독 6개월 코스",
    status: "신청가능",
    term: "2025.06 ~ 11 · 6개월",
    desc: "창세기부터 요한계시록까지",
  },
] as const;

export function StudyListReferenceScreen() {
  return (
    <Screen padded={false}>
      <TopBar
        testID="screen-life-study"
        title="동행"
        subtitle="기도로 동행하고, 말씀으로 자라가요"
        right={
          <MaterialIcons name="search" size={22} color={theme.colors.inkSoft} />
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={[
            { key: "pray", label: "중보기도" },
            { key: "study", label: "삶공부" },
          ]}
          active="study"
          onChange={() => undefined}
        />
      </View>
      <View style={styles.contentPad}>
        <Section title="신청가능·진행중">
          <View style={styles.stack}>
            {studyOpenCourses.map((course, index) => (
              <Card key={course.name} style={styles.studyCourseCard}>
                <View style={[styles.studyOrb, dayBoxStyle(index)]} />
                <View style={styles.inlineMeta}>
                  <Badge tone={course.status === "진행중" ? "primary" : "warn"}>
                    {course.status}
                  </Badge>
                  <Text style={styles.metaText}>{course.term}</Text>
                </View>
                <Text style={styles.titleText}>{course.name}</Text>
                <Text style={styles.bodyText}>{course.desc}</Text>
                {"progress" in course ? (
                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${course.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.primaryText}>{course.progress}%</Text>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        </Section>
        <Section title="마감·수료">
          <Card style={styles.menuCard}>
            {["알파코스 봄학기", "결혼예비학교 봄", "양육반 2024-가을"].map(
              (title, index) => (
                <View key={title} style={styles.menuRow}>
                  <View style={styles.softIcon}>
                    <MaterialIcons
                      name="menu-book"
                      size={22}
                      color={theme.colors.inkMute}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.metaText}>2025.03 ~ 05 · 종료</Text>
                  </View>
                  <Badge tone={index === 0 ? "mute" : "primary"}>
                    {index === 0 ? "마감" : "수료"}
                  </Badge>
                </View>
              ),
            )}
          </Card>
        </Section>
      </View>
    </Screen>
  );
}

export function StudyDetailReferenceScreen() {
  const curriculum = [
    "그리스도인의 정체성",
    "기도의 능력",
    "말씀과 묵상",
    "예배의 의미",
    "성령의 인도하심",
    "전도와 증인의 삶",
  ];

  return (
    <Screen>
      <TopBar
        title=""
        back
        onBack={() => router.back()}
        right={
          <MaterialIcons
            name="ios-share"
            size={22}
            color={theme.colors.inkSoft}
          />
        }
      />
      <View style={styles.inlineMeta}>
        <Badge>진행중</Badge>
        <Text style={styles.metaText}>2025.03 ~ 08 · 매주 수요일 19:30</Text>
      </View>
      <Text style={styles.displayTitle}>제자훈련 1단계</Text>
      <Text style={styles.bodyText}>
        예수님을 따르는 제자로 자라가는 12주 과정입니다. 매주 말씀 묵상, 적용
        나눔, 함께하는 기도로 구성됩니다.
      </Text>
      <Card style={styles.rowCard}>
        <Avatar name="이" size={36} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>이정민 목사</Text>
          <Text style={styles.metaText}>담당 양육자</Text>
        </View>
      </Card>
      <Section title="내 수강 현황">
        <Card style={styles.progressCard}>
          <View style={styles.spreadRow}>
            <Text style={styles.primaryText}>진도율</Text>
            <Text style={styles.statValue}>4 / 12 주차</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: "33%" }]} />
          </View>
          <View style={styles.statsGrid}>
            <Card style={styles.miniStat}>
              <Text style={styles.metaText}>제출한 과제</Text>
              <Text style={styles.cardTitle}>3 / 4</Text>
            </Card>
            <Card style={styles.miniStat}>
              <Text style={styles.metaText}>출석</Text>
              <Text style={styles.cardTitle}>4 / 4</Text>
            </Card>
          </View>
        </Card>
      </Section>
      <Section title="커리큘럼">
        <Card style={styles.menuCard}>
          {curriculum.map((title, index) => {
            const current = index === 3;
            const done = index < 4;

            return (
              <View key={title} style={styles.menuRow}>
                <View
                  style={[
                    styles.stepCircle,
                    done ? styles.stepDone : null,
                    current ? styles.stepCurrent : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      current ? styles.stepTextCurrent : null,
                    ]}
                  >
                    {done && !current ? "✓" : index + 1}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.metaText}>WEEK {index + 1}</Text>
                  <Text style={styles.menuTitle}>{title}</Text>
                </View>
                {current ? <Badge>이번주</Badge> : null}
              </View>
            );
          })}
        </Card>
      </Section>
      <View style={styles.bottomActions}>
        <Button variant="soft" icon="favorite-border">
          관심
        </Button>
        <Button>이번 주 과제 제출</Button>
      </View>
    </Screen>
  );
}

export function StudyApplyReferenceScreen() {
  return (
    <Screen>
      <TopBar title="수강 신청" back onBack={() => router.back()} />
      <Card style={styles.stack}>
        <Badge>신청가능</Badge>
        <Text style={styles.displayTitle}>새가족반</Text>
        <Text style={styles.bodyText}>교회 첫걸음, 함께 시작해요.</Text>
        <InfoRow label="기간" value="2025.05 ~ 06 · 6주" />
        <InfoRow label="담당" value="이정민 목사" />
        <Button>신청하기</Button>
      </Card>
    </Screen>
  );
}

export function StudyHistoryReferenceScreen() {
  return (
    <Screen>
      <TopBar title="수강 내역" back onBack={() => router.back()} />
      <View style={styles.stack}>
        {["알파코스 봄학기", "결혼예비학교 봄", "양육반 2024-가을"].map(
          (title, index) => (
            <Card key={title} style={styles.rowCard}>
              <View style={styles.softIcon}>
                <MaterialIcons
                  name="menu-book"
                  size={22}
                  color={theme.colors.inkMute}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.metaText}>
                  {index === 0 ? "마감" : "수료"} · 2025.03 ~ 05
                </Text>
              </View>
            </Card>
          ),
        )}
      </View>
    </Screen>
  );
}

export function MyPageReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen padded={false}>
      <TopBar title="마이페이지" testID="screen-mypage" />
      <View style={styles.contentPad}>
        <Card style={styles.myProfileCard}>
          <Avatar name="김은혜" size={60} />
          <View style={styles.flex}>
            <Text style={styles.profileName}>김은혜</Text>
            <Text style={styles.metaText}>열린문교회</Text>
          </View>
          <Button variant="ghost">프로필 수정</Button>
        </Card>
        <SectionLabelText>활동 관리</SectionLabelText>
        <Card style={styles.menuCard}>
          <MenuRow icon="history" title="내 활동" value="" />
          <MenuRow icon="favorite-border" title="관심목록" value="" />
          <MenuRow icon="block" title="차단 관리" value="" last />
        </Card>
        <SectionLabelText>고객센터</SectionLabelText>
        <Card style={styles.menuCard}>
          <MenuRow icon="notifications-none" title="알림 설정" value="" />
          <MenuRow icon="support-agent" title="고객센터" value="" />
          <MenuRow icon="help-outline" title="FAQ" value="" />
          <MenuRow icon="description" title="약관" value="" />
          <MenuRow icon="privacy-tip" title="개인정보 처리방침" value="" last />
        </Card>
        <SectionLabelText>계정</SectionLabelText>
        <Card style={styles.menuCard}>
          <MenuRow icon="manage-accounts" title="계정 관리" value="" />
          <MenuRow icon="logout" title="로그아웃" value="" last />
        </Card>
        <SectionLabelText>계정 관리</SectionLabelText>
        <Card style={styles.menuCard}>
          <MenuRow icon="person-remove" title="회원탈퇴" value="" last />
        </Card>
        <Text style={styles.versionText}>v 1.0.2 · 열린문 커넥트</Text>
      </View>
      <ConfirmDialog
        visible={variant === "logout-confirm"}
        title="로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    </Screen>
  );
}

export function MyWishlistReferenceScreen() {
  return (
    <Screen>
      <TopBar title="관심목록" back onBack={() => router.back()} />
      <View style={styles.stack}>
        {marketPosts.map((post, index) => (
          <Card key={post.title} style={styles.marketRow}>
            <VisualThumb size={70} seed={index} />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{post.title}</Text>
              <Text style={styles.metaText}>
                {post.author} · {post.when}
              </Text>
            </View>
            <MaterialIcons
              name="favorite"
              size={22}
              color={theme.colors.danger}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

export function NotificationSettingsReferenceScreen() {
  const rows = [
    { title: "공지 알림", desc: "교회 공지와 앱 안내" },
    { title: "나눔 댓글", desc: "내 나눔 게시글 댓글" },
    { title: "소모임 공지", desc: "참여 중인 소모임 새 공지" },
    { title: "기도방 알림", desc: "새 기도제목과 응답" },
  ];

  return (
    <Screen>
      <TopBar title="알림 설정" back onBack={() => router.back()} />
      <Card style={styles.menuCard}>
        {rows.map((row, index) => (
          <View key={row.title} style={styles.settingRow}>
            <View style={styles.flex}>
              <Text style={styles.menuTitle}>{row.title}</Text>
              <Text style={styles.metaText}>{row.desc}</Text>
            </View>
            <View
              style={[
                styles.switchTrack,
                index === 1 ? styles.switchOff : null,
              ]}
            >
              <View
                style={[
                  styles.switchKnob,
                  index === 1 ? styles.switchKnobOff : null,
                ]}
              />
            </View>
          </View>
        ))}
      </Card>
      <Card style={styles.warningCard}>
        <Text style={styles.warningText}>
          거래 채팅 알림은 chat/v2 범위라 v1에서는 표시하지 않습니다.
        </Text>
      </Card>
    </Screen>
  );
}

export function SupportReferenceScreen() {
  return (
    <Screen>
      <TopBar title="고객센터" back onBack={() => router.back()} />
      <Card style={styles.supportHero}>
        <MaterialIcons
          name="support-agent"
          size={44}
          color={theme.colors.primaryDeep}
        />
        <Text style={styles.displayTitle}>무엇을 도와드릴까요?</Text>
        <Text style={styles.bodyText}>
          앱 이용 중 불편한 점이나 문의사항을 남겨주세요.
        </Text>
      </Card>
      <Card style={styles.menuCard}>
        <MenuRow icon="help-outline" title="자주 묻는 질문" value="" />
        <MenuRow icon="mail-outline" title="1:1 문의" value="" />
        <MenuRow icon="description" title="이용약관" value="" last />
      </Card>
    </Screen>
  );
}

export function InquiryReferenceScreen() {
  return (
    <Screen>
      <TopBar title="1:1 문의" back onBack={() => router.back()} />
      <Card style={styles.stack}>
        <TextField label="제목" value="앱 사용 문의" />
        <TextField label="이메일" value="eunhye@example.com" />
        <Textarea
          label="문의 내용"
          value="알림을 받지 못하고 있어 확인 부탁드립니다."
        />
        <Button>문의 보내기</Button>
      </Card>
    </Screen>
  );
}

export function AccountReferenceScreen() {
  return (
    <Screen>
      <TopBar title="계정 관리" back onBack={() => router.back()} />
      <Card style={styles.rowCard}>
        <Avatar name="김은혜" size={54} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>김은혜</Text>
          <Text style={styles.metaText}>ylmc2026 · 010-2345-6789</Text>
        </View>
      </Card>
      <Card style={styles.menuCard}>
        <MenuRow icon="lock-outline" title="비밀번호 변경" value="" />
        <MenuRow icon="phone-iphone" title="연락처 변경" value="" />
        <MenuRow icon="logout" title="로그아웃" value="" />
        <MenuRow icon="person-remove" title="회원 탈퇴" value="" last />
      </Card>
    </Screen>
  );
}

export function ProfileEditReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen>
      <TopBar title="프로필 수정" back onBack={() => router.back()} />
      <Card style={styles.rowCard}>
        <Avatar name="김은혜" size={56} />
        <View style={styles.flex}>
          <Text style={styles.metaText}>이름</Text>
          <Text style={styles.cardTitle}>김은혜</Text>
          <Text style={styles.metaText}>이름과 프로필은 변경할 수 없어요</Text>
        </View>
      </Card>
      <Card style={styles.stack}>
        <TextField
          label="연락처"
          value={variant === "phone-dup" ? "010-9999-9999" : "010-2345-6789"}
          error={
            variant === "phone-dup" ? "이미 사용 중인 연락처입니다" : undefined
          }
        />
        <TextField
          label="현재 비밀번호"
          secureTextEntry
          value={variant === "current-pw-error" ? "password" : ""}
          error={
            variant === "current-pw-error"
              ? "현재 비밀번호가 올바르지 않습니다"
              : undefined
          }
        />
        <TextField label="새 비밀번호" secureTextEntry value="spring2026!" />
        <TextField
          label="새 비밀번호 확인"
          secureTextEntry
          value={variant === "pw-mismatch" ? "spring2025" : "spring2026!"}
          error={
            variant === "pw-mismatch"
              ? "비밀번호가 일치하지 않습니다"
              : undefined
          }
        />
        <Button>저장</Button>
      </Card>
    </Screen>
  );
}

export function ActivityReferenceScreen({ variant }: { variant: string }) {
  const empty = variant === "empty";
  const title =
    variant === "comments"
      ? "댓글"
      : variant === "groups"
        ? "소모임"
        : "나눔 게시글";

  return (
    <Screen>
      <TopBar title="활동 내역" back onBack={() => router.back()} />
      <Section title={title}>
        {empty ? (
          <Card style={styles.emptyCard}>
            <MaterialIcons
              name="inbox"
              size={42}
              color={theme.colors.inkHint}
            />
            <Text style={styles.bodyText}>아직 활동 내역이 없습니다.</Text>
          </Card>
        ) : (
          <View style={styles.stack}>
            {[
              "아이 장난감 정리하면서 나눔합니다",
              "토요 산악회",
              "감사합니다",
            ].map((item) => (
              <Card key={item} style={styles.rowCard}>
                <MaterialIcons
                  name="history"
                  size={22}
                  color={theme.colors.primaryDeep}
                />
                <Text style={styles.cardTitle}>{item}</Text>
                <Text style={styles.metaText}>최근</Text>
              </Card>
            ))}
          </View>
        )}
      </Section>
    </Screen>
  );
}

export function BlockedReferenceScreen({ variant }: { variant: string }) {
  const empty = variant === "empty";
  return (
    <Screen>
      <TopBar title="차단 사용자" back onBack={() => router.back()} />
      {empty ? (
        <Card style={styles.emptyCard}>
          <MaterialIcons name="block" size={42} color={theme.colors.inkHint} />
          <Text style={styles.bodyText}>차단한 사용자가 없습니다.</Text>
        </Card>
      ) : (
        <Card style={styles.rowCard}>
          <Avatar name="박정아" size={44} />
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>박정아</Text>
            <Text style={styles.metaText}>2026.05.22 차단</Text>
          </View>
          <Button variant="soft">해제</Button>
        </Card>
      )}
      <ConfirmDialog
        visible={variant === "confirm"}
        title="이모씨님의 차단을 해제할까요?"
        message="해제 후에는 상대의 게시글과 댓글이 다시 보이며, 상대도 회원님의 활동을 볼 수 있게 됩니다."
        confirmText="차단 해제"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast message={variant === "toast" ? "차단을 해제했습니다." : ""} />
    </Screen>
  );
}

export function FaqReferenceScreen({ empty = false }: { empty?: boolean }) {
  return (
    <Screen>
      <TopBar title="FAQ" back onBack={() => router.back()} />
      {empty ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.bodyText}>등록된 FAQ가 없습니다.</Text>
        </Card>
      ) : (
        <Card style={styles.menuCard}>
          <MenuRow
            icon="help-outline"
            title="나눔 글은 어떻게 올리나요?"
            value="열림"
          />
          <Text style={styles.bodyText}>
            나눔 탭에서 글쓰기 버튼을 눌러 사진과 설명을 등록할 수 있습니다.
          </Text>
          <MenuRow
            icon="help-outline"
            title="소모임 참여는 어떻게 하나요?"
            value="닫힘"
          />
          <MenuRow
            icon="help-outline"
            title="기도방 알림은 어떻게 받나요?"
            value="닫힘"
            last
          />
        </Card>
      )}
    </Screen>
  );
}

export function LegalReferenceScreen({
  privacy = false,
}: {
  privacy?: boolean;
}) {
  return (
    <Screen>
      <TopBar
        title={privacy ? "개인정보처리방침" : "이용약관"}
        back
        onBack={() => router.back()}
      />
      <Card style={styles.stack}>
        <Text style={styles.cardTitle}>
          {privacy ? "제1조 (수집하는 개인정보 항목)" : "제1조 (목적)"}
        </Text>
        {legalParagraphs.map((text) => (
          <Text key={text} style={styles.bodyText}>
            {text}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}

export function WithdrawReferenceScreen({
  confirm = false,
}: {
  confirm?: boolean;
}) {
  return (
    <Screen>
      <TopBar title="회원 탈퇴" back onBack={() => router.back()} />
      <View style={styles.displayBlock}>
        <Text style={styles.displayTitle}>정말 떠나시나요?</Text>
        <Text style={styles.bodyText}>
          탈퇴 전에 아래 안내를 꼭 확인해주세요.
        </Text>
      </View>
      <Card style={styles.warningCard}>
        {[
          "작성한 나눔 게시글·댓글은 익명으로 남습니다",
          "탈퇴 후 재가입해도 기존 데이터는 복구할 수 없습니다",
          "탈퇴 즉시 개인정보가 파기됩니다",
          "소모임장인 경우 가장 먼저 가입한 멤버에게 자동 이관됩니다",
        ].map((item) => (
          <Text key={item} style={styles.warningText}>
            • {item}
          </Text>
        ))}
      </Card>
      <Button variant="danger">탈퇴하기</Button>
      <ConfirmDialog
        visible={confirm}
        title="정말 탈퇴하시겠습니까?"
        message="이 작업은 되돌릴 수 없으며, 모든 데이터가 즉시 삭제됩니다."
        confirmText="탈퇴"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    </Screen>
  );
}

export function UserProfileReferenceScreen({ variant }: { variant: string }) {
  if (variant === "blocked") {
    return (
      <Screen>
        <TopBar title="프로필" back onBack={() => router.back()} />
        <Card style={styles.emptyCard}>
          <MaterialIcons name="block" size={54} color={theme.colors.inkHint} />
          <Text style={styles.cardTitle}>확인할 수 없는 프로필입니다</Text>
          <Text style={styles.bodyText}>
            차단한 사용자의 프로필은 볼 수 없어요.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="프로필" back onBack={() => router.back()} />
      <Card style={styles.profileHero}>
        <Avatar name={variant === "withdrawn" ? "?" : "박정아"} size={82} />
        <Text style={styles.displayTitle}>
          {variant === "withdrawn" ? "알 수 없음" : "박정아"}
        </Text>
        <Text style={styles.bodyText}>
          {variant === "withdrawn"
            ? "탈퇴한 사용자입니다."
            : "열린문교회 · 청년 2부"}
        </Text>
      </Card>
      {variant !== "withdrawn" ? <Button variant="soft">차단</Button> : null}
      <ConfirmDialog
        visible={variant === "block-confirm"}
        title="박정아님을 차단할까요?"
        message="차단한 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의 활동을 볼 수 없어요."
        confirmText="차단"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={variant === "block-toast" ? "사용자를 차단했습니다." : ""}
      />
    </Screen>
  );
}

function MenuRow({
  icon,
  title,
  value,
  last,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.menuRow, last ? styles.noBorder : null]}>
      <MaterialIcons name={icon} size={21} color={theme.colors.inkSoft} />
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.metaText}>{value}</Text>
      <MaterialIcons
        name="chevron-right"
        size={18}
        color={theme.colors.inkHint}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.metaText}>{label}</Text>
      <Text style={styles.cardTitle}>{value}</Text>
    </View>
  );
}

function StatusBanner({
  icon,
  title,
  description,
  tone = "done",
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  tone?: "done" | "warn";
}) {
  const warn = tone === "warn";
  return (
    <View style={[styles.statusBanner, warn ? styles.statusBannerWarn : null]}>
      <View style={[styles.statusIcon, warn ? styles.statusIconWarn : null]}>
        <MaterialIcons name={icon} size={16} color="#fff" />
      </View>
      <View style={styles.flex}>
        <Text style={styles.statusBannerTitle}>{title}</Text>
        <Text style={styles.statusBannerText}>{description}</Text>
      </View>
    </View>
  );
}

function DetailAction({
  icon,
  label,
  danger,
  full,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
  full?: boolean;
}) {
  return (
    <View style={[styles.detailAction, full ? styles.detailActionFull : null]}>
      <View
        style={[
          styles.detailActionIcon,
          danger ? styles.detailActionDangerIcon : null,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color={danger ? theme.colors.danger : theme.colors.primaryDeep}
        />
      </View>
      <Text
        style={[
          styles.detailActionText,
          danger ? styles.detailActionDangerText : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionLabelText({ children }: { children: string }) {
  return <Text style={styles.sectionLabelText}>{children}</Text>;
}

function dayBoxStyle(index: number) {
  const colors = [
    { backgroundColor: "#E0E9DE" },
    { backgroundColor: "#F3E8D7" },
    { backgroundColor: "#DDE5CD" },
    { backgroundColor: "#E7D2CB" },
  ];

  return colors[index % colors.length];
}

function dayTextStyle(index: number) {
  const colors = [
    { color: "#6B8260" },
    { color: "#9A7A3D" },
    { color: "#506B47" },
    { color: "#883C2D" },
  ];

  return colors[index % colors.length];
}

const legalParagraphs = [
  "열린문 커넥트는 성도 간 안전한 소통과 공동체 활동을 돕기 위한 서비스입니다.",
  "서비스 이용 중 타인을 배려하지 않는 게시글이나 활동은 제한될 수 있습니다.",
  "개인정보는 교회 공동체 운영 목적 안에서 필요한 범위로만 사용됩니다.",
];

const marketStatusTabs = [
  { key: "all", label: "전체" },
  { key: "sharing", label: "나눔중" },
  { key: "reserved", label: "예약중" },
  { key: "done", label: "나눔완료" },
] as const;

const marketCategories = [
  { key: "all", label: "전체" },
  { key: "baby", label: "유아·아동용품" },
  { key: "home", label: "가전·가구" },
  { key: "book", label: "도서·문구" },
  { key: "cloth", label: "의류·잡화" },
] as const;

const marketReportReasons = [
  "금지 품목 게시",
  "허위 물품 정보",
  "금전 요구·암묵적 거래 유도",
  "동일 물품 중복 게시",
  "타인 사진 무단 도용",
  "나눔을 빙자한 홍보·광고",
  "욕설·혐오 표현",
  "기타",
] as const;

const marketPosts = [
  {
    title: "아이 장난감 정리하면서 나눔합니다",
    author: "박정아",
    when: "1시간 전",
    status: "sharing",
  },
  {
    title: "토스터기·전기주전자 세트 나눔해요",
    author: "이수진",
    when: "3시간 전",
    status: "reserved",
  },
  {
    title: "어린이 동화책 30권 묶음 나눔",
    author: "정혜진",
    when: "어제",
    status: "done",
  },
] as const;

const groupTabs = [
  { key: "all", label: "전체" },
  { key: "mine", label: "내 소모임" },
] as const;

const groupCategories = [
  { key: "all", label: "전체" },
  { key: "sport", label: "운동·건강" },
  { key: "hobby", label: "취미·문화" },
  { key: "pray", label: "기도모임" },
  { key: "volunteer", label: "봉사" },
] as const;

const groupItems = [
  {
    name: "토요 산악회",
    category: "운동·건강",
    description: "매주 토요일 함께 산을 오르며 자연과 신앙을 나눕니다.",
    count: 18,
    max: 25,
    closed: false,
  },
  {
    name: "독서 나눔",
    category: "취미·문화",
    description: "매월 한 권의 책을 함께 읽고 삶과 믿음을 나눕니다.",
    count: 12,
    max: 15,
    closed: false,
  },
  {
    name: "찬양 동아리",
    category: "취미·문화",
    description: "함께 찬양하고 연주하며 마음을 모읍니다.",
    count: 15,
    max: 15,
    closed: true,
  },
] as const;

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.primary,
  },
  splashOrbTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  splashOrbBottom: {
    position: "absolute",
    left: -80,
    bottom: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  splashLogo: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  splashTitle: {
    marginTop: 22,
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  splashSub: { marginTop: 8, color: "rgba(255,255,255,0.82)", fontSize: 13 },
  splashDots: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  authHero: {
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 12,
    gap: 10,
  },
  authLogo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  displayBlock: { gap: 10, paddingTop: 4 },
  displayTitle: { color: theme.colors.ink, fontSize: 23, fontWeight: "900" },
  bodyText: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 21 },
  errorText: { color: theme.colors.danger, fontSize: 13, fontWeight: "700" },
  metaText: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  stack: { gap: 12 },
  sheetField: { marginTop: 14 },
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 8 },
  routeList: { gap: 12, paddingHorizontal: 18 },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  marketHero: {
    position: "relative",
    height: 360,
    overflow: "hidden",
    backgroundColor: "#E2DED3",
  },
  marketHeroCover: {
    height: 360,
    borderRadius: 0,
  },
  marketHeroScrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 130,
    backgroundColor: "rgba(20,30,18,0.22)",
  },
  overlayBack: {
    position: "absolute",
    top: 20,
    left: 16,
    minHeight: 34,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  overlayBackText: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  marketHeroDoneCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.45)",
  },
  marketHeroReservedCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 158,
    alignItems: "center",
  },
  marketHeroStatus: {
    minWidth: 96,
    minHeight: 48,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  marketHeroReserved: {
    backgroundColor: "#E89A3C",
    shadowColor: "rgba(20,30,18,0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  marketHeroDone: {
    backgroundColor: "transparent",
  },
  marketHeroStatusText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  marketHeroReservedText: {
    fontSize: 20,
  },
  heroPager: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  heroPagerActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  heroPagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface2,
  },
  statusBannerWarn: {
    borderWidth: 1,
    borderColor: "rgba(232,154,60,0.32)",
    backgroundColor: "rgba(232,154,60,0.12)",
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.85)",
  },
  statusIconWarn: {
    backgroundColor: "#E89A3C",
  },
  statusBannerTitle: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  statusBannerText: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "600",
  },
  marketAuthorBlock: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  marketDetailContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  marketBody: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 22,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 24,
  },
  detailActionCard: {
    marginHorizontal: 16,
    marginBottom: 22,
    padding: 4,
    flexDirection: "row",
  },
  detailAction: {
    flex: 1,
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: theme.radius.md,
  },
  detailActionFull: {
    flexDirection: "row",
    minHeight: 54,
  },
  detailActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  detailActionDangerIcon: {
    backgroundColor: "rgba(201,124,110,0.14)",
  },
  detailActionText: {
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  detailActionDangerText: {
    color: theme.colors.danger,
  },
  detailTopPad: {
    paddingHorizontal: 18,
  },
  groupDetailHeader: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 18,
    gap: 12,
  },
  groupDetailTitle: {
    color: theme.colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  groupMetaText: {
    color: theme.colors.inkSoft,
    fontSize: 14,
    fontWeight: "700",
  },
  groupLeaderCard: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface2,
  },
  groupActionWrap: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  memberRail: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    flexDirection: "row",
    gap: 16,
  },
  memberMini: {
    width: 56,
    alignItems: "center",
    gap: 6,
  },
  memberAvatarWrap: {
    position: "relative",
  },
  memberLeaderMark: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  memberMiniName: {
    maxWidth: 56,
    color: theme.colors.inkSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  groupNoticeList: {
    paddingHorizontal: 22,
    paddingBottom: 16,
    gap: 10,
  },
  transferWarning: {
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 14,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(217,131,92,0.10)",
  },
  transferWarningText: {
    flex: 1,
    color: "#A8643F",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  memberCountText: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 6,
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "800",
  },
  memberList: {
    paddingBottom: 96,
  },
  groupMemberRow: {
    minHeight: 70,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupMemberRowSelected: {
    backgroundColor: theme.colors.primarySoft,
  },
  groupMemberRowDisabled: {
    opacity: 0.42,
  },
  memberRadioMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  memberRadioMarkSelected: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  memberRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberMeText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800",
  },
  kickPill: {
    minHeight: 32,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(201,124,110,0.10)",
  },
  kickPillText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  fixedBottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: "rgba(246,247,242,0.94)",
  },
  marketRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  thumbWrap: { position: "relative" },
  thumbBadge: {
    position: "absolute",
    left: 6,
    top: 6,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: "rgba(20,30,18,0.78)",
  },
  thumbBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  flex: { flex: 1, minWidth: 0 },
  softIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  cardTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  titleText: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 30,
  },
  actions: { flexDirection: "row", gap: 8 },
  menuCard: { paddingVertical: 2 },
  menuRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  noBorder: { borderBottomWidth: 0 },
  menuTitle: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  summaryBanner: { gap: 4 },
  infoRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  emptyCard: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  warningCard: {
    gap: 10,
    backgroundColor: "rgba(201,124,110,0.10)",
    borderColor: "rgba(201,124,110,0.20)",
  },
  warningText: { color: "#7B3A2D", fontSize: 13, lineHeight: 20 },
  profileHero: { alignItems: "center", gap: 8, paddingVertical: 28 },
  homeHeader: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  brandTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  noticeDot: {
    position: "absolute",
    right: -1,
    top: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
  },
  contentPad: { paddingHorizontal: 18, gap: 16 },
  noticeBanner: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.sage,
    borderColor: "rgba(255,255,255,0.35)",
  },
  noticeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  noticeEyebrow: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 11,
    fontWeight: "800",
  },
  noticeHeadline: { color: "#fff", fontSize: 15, fontWeight: "900" },
  noticePagers: { flexDirection: "row", gap: 4 },
  noticePager: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  noticePagerActive: { backgroundColor: "#fff" },
  moreText: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  rail: { flexDirection: "row", gap: 12, paddingHorizontal: 18 },
  homeGroupCard: { width: 220, gap: 8 },
  statsGrid: { flexDirection: "row", gap: 10, paddingHorizontal: 18 },
  statPanel: { flex: 1, minHeight: 118, overflow: "hidden" },
  statWarm: { backgroundColor: theme.colors.amberSoft },
  statNumber: {
    marginTop: 6,
    color: theme.colors.primaryDeep,
    fontSize: 28,
    fontWeight: "900",
  },
  statUnit: { fontSize: 12, fontWeight: "800" },
  warmText: { color: "#7A5E2C" },
  smallRail: { flexDirection: "row", gap: 12, paddingHorizontal: 18 },
  newGroupTile: { width: 150, gap: 8 },
  inlineMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  marketGrid: {
    paddingHorizontal: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  priceText: { marginTop: 2, color: theme.colors.ink, fontWeight: "900" },
  primaryText: { color: theme.colors.primaryDeep, fontWeight: "900" },
  prayerRoomCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  dayBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 20, fontWeight: "900" },
  smallDayBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  smallDayText: { fontSize: 17, fontWeight: "900" },
  detailMetaRow: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  prayerCard: { gap: 12 },
  faded: { opacity: 0.58 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  studyCourseCard: { gap: 8, overflow: "hidden" },
  studyOrb: {
    position: "absolute",
    right: -10,
    top: -10,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.72,
  },
  progressRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(30,41,32,0.08)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  progressCard: {
    gap: 12,
    backgroundColor: "#F4F8EE",
    borderColor: "rgba(91,122,176,0.12)",
  },
  spreadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    color: theme.colors.primaryDeep,
    fontSize: 20,
    fontWeight: "900",
  },
  miniStat: { flex: 1, backgroundColor: "rgba(255,255,255,0.65)" },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,41,32,0.05)",
  },
  stepDone: { backgroundColor: theme.colors.primarySoft },
  stepCurrent: { backgroundColor: theme.colors.primary },
  stepText: {
    color: theme.colors.primaryDeep,
    fontSize: 11,
    fontWeight: "900",
  },
  stepTextCurrent: { color: "#fff" },
  bottomActions: { flexDirection: "row", gap: 8 },
  myProfileCard: { flexDirection: "row", alignItems: "center", gap: 16 },
  profileName: { color: theme.colors.ink, fontSize: 17, fontWeight: "900" },
  sectionLabelText: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "900",
  },
  versionText: {
    paddingVertical: 20,
    textAlign: "center",
    color: theme.colors.inkHint,
    fontSize: 11,
    fontWeight: "700",
  },
  settingRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  switchTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    padding: 3,
    alignItems: "flex-end",
    backgroundColor: theme.colors.primary,
  },
  switchOff: {
    alignItems: "flex-start",
    backgroundColor: "rgba(30,41,32,0.12)",
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  switchKnobOff: { backgroundColor: theme.colors.surface },
  supportHero: { alignItems: "center", gap: 10, paddingVertical: 28 },
});
