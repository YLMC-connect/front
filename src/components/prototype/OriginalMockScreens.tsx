import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
        message={variant === "toast" ? "네트워크 연결을 확인해주세요" : ""}
      />
    </Screen>
  );
}

export function InviteCodeReferenceScreen({ variant }: { variant: string }) {
  const code = variant === "default" ? "" : "A1B2C";
  const isError = variant === "error";
  const isLoading = variant === "loading";
  const filled = code.length > 0;

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.inviteRoot}>
        <TopBar title="가입 코드" back onBack={() => router.back()} />
        <View style={styles.inviteBody}>
          <View style={styles.inviteIntro}>
            <Text style={styles.inviteDisplay}>가입 코드를 입력해주세요</Text>
            <Text style={styles.inviteDescription}>
              교회에서 발급받은 가입 코드를 입력하면 회원가입을 시작할 수
              있어요.
            </Text>
          </View>

          <View style={styles.inviteFieldBlock}>
            <Text style={styles.inviteLabel}>가입 코드</Text>
            <View
              style={[
                styles.inviteInput,
                isError ? styles.inviteInputError : null,
              ]}
            >
              <Text style={styles.inviteInputText}>{code || "예) A1B2C"}</Text>
            </View>
            {isError ? (
              <Text style={styles.inviteError}>
                유효하지 않은 가입 코드입니다
              </Text>
            ) : (
              <Text style={styles.inviteHint}>
                5자리 코드를 정확히 입력해주세요
              </Text>
            )}
          </View>

          <View style={styles.inviteHelpCard}>
            <MaterialIcons name="info" size={18} color={theme.colors.inkHint} />
            <Text style={styles.inviteHelpText}>
              가입 코드 관련 문의는 열린문교회로 연락해주세요. 코드는 1회만 사용
              가능합니다.
            </Text>
          </View>
        </View>

        <View style={styles.inviteSpacer} />
        <View style={styles.inviteBottomFlat}>
          <Button
            loading={isLoading}
            disabled={!filled && variant === "default"}
          >
            확인
          </Button>
        </View>
      </View>
      <Toast
        message={variant === "toast" ? "네트워크 연결을 확인해주세요" : ""}
        offset={variant === "toast" ? 106 : 28}
      />
    </Screen>
  );
}

export function TermsReferenceScreen({ sheet = false }: { sheet?: boolean }) {
  const terms = [
    { key: "tos", label: "서비스 이용약관", required: true },
    { key: "privacy", label: "개인정보 처리방침", required: true },
    { key: "loc", label: "위치 기반 서비스 이용약관", required: false },
    { key: "mkt", label: "마케팅 정보 수신 동의", required: false },
  ] as const;

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.termsRoot}>
        <View style={styles.termsBase}>
          <TopBar title="서비스 이용 동의" back onBack={() => router.back()} />
          <View style={styles.termsBody}>
            <Text
              style={[
                styles.termsDisplay,
                sheet ? styles.termsDimmedContent : null,
              ]}
            >
              약관에 동의해주세요
            </Text>
            <Text
              style={[
                styles.termsDescription,
                sheet ? styles.termsDimmedContent : null,
              ]}
            >
              서비스 이용을 위해 약관 동의가 필요해요.
            </Text>

            <View
              style={[
                styles.termsAgreeAll,
                sheet ? styles.termsDimmedContent : null,
              ]}
            >
              <View style={styles.termsCheckLarge} />
              <Text style={styles.termsAgreeAllText}>전체 동의하기</Text>
            </View>

            {!sheet ? (
              <View style={styles.termsList}>
                {terms.map((term) => (
                  <View key={term.key} style={styles.termsRow}>
                    <View style={styles.termsCheck} />
                    <View style={styles.termsRowTextWrap}>
                      <Text style={styles.termsRowText}>
                        <Text style={styles.termsRequired}>
                          [{term.required ? "필수" : "선택"}]{" "}
                        </Text>
                        {term.label}
                      </Text>
                    </View>
                    <View style={styles.termsViewFull}>
                      <Text style={styles.termsViewFullText}>전문 보기</Text>
                      <MaterialIcons
                        name="chevron-right"
                        size={14}
                        color={theme.colors.inkSoft}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {!sheet ? (
            <View style={styles.termsBottomFlat}>
              <View style={styles.termsNextButton}>
                <Text style={styles.termsNextText}>다음</Text>
              </View>
            </View>
          ) : null}
        </View>

        {sheet ? (
          <View style={styles.termsSheetOverlay}>
            <View style={styles.termsSheetBackdrop} />
            <View style={styles.termsSheetPanel}>
              <View style={styles.termsSheetHandleWrap}>
                <View style={styles.termsSheetHandle} />
              </View>
              <View style={styles.termsSheetHeader}>
                <Text style={styles.termsSheetTitle}>서비스 이용약관</Text>
                <View style={styles.termsSheetClose}>
                  <MaterialIcons
                    name="close"
                    size={17}
                    color={theme.colors.inkSoft}
                  />
                </View>
              </View>
              <ScrollView
                style={styles.termsSheetScroll}
                contentContainerStyle={styles.termsSheetContent}
              >
                <Text style={styles.termsSheetDate}>
                  시행일자: 2026년 1월 1일
                </Text>
                <Text style={styles.termsSheetText}>{legalText}</Text>
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>
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
    <Screen padded={false} scroll={false}>
      <ScrollView contentContainerStyle={styles.marketDetailScroll}>
        <View style={styles.marketHero}>
          <VisualThumb size={360} seed={0} style={styles.marketHeroCover} />
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
                  isReserved
                    ? styles.marketHeroReserved
                    : styles.marketHeroDone,
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
            <Avatar name="박정아" seed="박정아" />
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>
                {isOwn ? "김은혜" : "박정아"}
              </Text>
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
          <MarketCommentsSection isOwn={isOwn} />
        </View>
      </ScrollView>
      <MarketCommentComposer
        multiline={variant === "composer-multiline"}
        value={
          variant === "composer-multiline"
            ? "혹시 토요일 외에 다른 요일도 가능할까요?\n저희가 토요일은 봉사 일정이 있어서요.\n가능한 시간 알려주시면 맞춰서 찾아뵐게요!"
            : ""
        }
      />
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
          variant === "report-dup-toast" ? "이미 신고한 게시글입니다" : ""
        }
        offset={variant === "report-dup-toast" ? 106 : 28}
      />
    </Screen>
  );
}

function MarketCommentsSection({ isOwn }: { isOwn: boolean }) {
  const comments = [
    {
      author: "이수진",
      when: "30분 전",
      text: "필요해요! 토요일에 들를게요. 연락드릴게요 :)",
      self: !isOwn,
    },
    {
      author: "김지영",
      when: "25분 전",
      text: "좋은 나눔 감사해요. 저도 비슷한 시기에 정리했는데 도움이 많이 됐어요!",
      edited: true,
    },
    { author: "정혜진", when: "20분 전", text: "", deleted: true },
    {
      author: "한유라",
      when: "10분 전",
      text: "아직 남아있을까요? 늦었지만 가능하면 부탁드려요",
      self: isOwn,
    },
  ];
  const activeCount = comments.filter((comment) => !comment.deleted).length;

  return (
    <View style={styles.marketComments}>
      <Text style={styles.marketCommentsTitle}>댓글 {activeCount}개</Text>
      {comments.map((comment, index) => (
        <View
          key={`${comment.author}-${comment.when}`}
          style={[
            styles.marketCommentRow,
            index === comments.length - 1 ? styles.noBorder : null,
          ]}
        >
          <Avatar name={comment.author} seed={comment.author} size={32} />
          <View style={styles.flex}>
            <View style={styles.commentMetaRow}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.metaText}>{comment.when}</Text>
              {comment.edited ? (
                <Text style={styles.commentEdited}>· 수정됨</Text>
              ) : null}
            </View>
            {comment.deleted ? (
              <Text style={styles.commentDeleted}>삭제된 댓글입니다</Text>
            ) : (
              <>
                <Text style={styles.commentBody}>{comment.text}</Text>
                <View style={styles.commentActions}>
                  {comment.self ? (
                    <>
                      <MarketCommentMiniAction icon="edit" label="수정" />
                      <MarketCommentMiniAction
                        icon="delete-outline"
                        label="삭제"
                        danger
                      />
                    </>
                  ) : (
                    <MarketCommentMiniAction icon="flag" label="신고" />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function MarketCommentMiniAction({
  icon,
  label,
  danger,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.commentMiniAction}>
      <MaterialIcons
        name={icon}
        size={14}
        color={danger ? theme.colors.danger : theme.colors.inkMute}
      />
      <Text
        style={[
          styles.commentMiniActionText,
          danger ? styles.commentMiniActionDanger : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MarketCommentComposer({
  value = "",
  multiline = false,
}: {
  value?: string;
  multiline?: boolean;
}) {
  const hasText = value.length > 0;
  const preview = value.replace(/\n+/g, " · ");

  return (
    <>
      {hasText && multiline ? (
        <View style={styles.marketComposerPreview}>
          <Text style={styles.marketComposerPreviewText}>{value}</Text>
          <Text style={styles.marketComposerPreviewCount}>
            {value.length}/300
          </Text>
          <View style={styles.marketComposerPreviewTail} />
        </View>
      ) : null}
      <View style={styles.marketComposerBar}>
        <View style={styles.marketComposerInput}>
          <Text
            numberOfLines={1}
            style={[
              styles.marketComposerText,
              !hasText ? styles.marketComposerPlaceholder : null,
            ]}
          >
            {hasText && multiline ? preview : "댓글을 입력해주세요"}
          </Text>
          {hasText && multiline ? (
            <Text style={styles.marketComposerCount}>{value.length}/300</Text>
          ) : null}
        </View>
        <View
          style={[
            styles.marketComposerButton,
            hasText ? styles.marketComposerButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.marketComposerButtonText,
              hasText ? styles.marketComposerButtonTextActive : null,
            ]}
          >
            등록
          </Text>
        </View>
      </View>
    </>
  );
}

export function MarketCreateReferenceScreen({ variant }: { variant: string }) {
  const isEdit = variant === "edit";
  const filled =
    isEdit ||
    variant === "create-filled" ||
    variant === "back-warn" ||
    variant === "limit-toast";
  const title = filled
    ? "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)"
    : "";
  const description = filled
    ? `아이가 커서 더 이상 쓰지 않는 장난감 정리해요.
대부분 깨끗하게 사용한 것들이고, 블록류 20점 + 인형류 10점 정도 됩니다.
필요하신 분께 무료로 드려요!

수령은 토요일 오후 교회 1층 로비에서 가능합니다.`
    : "";
  const photos = filled ? [0, 1, 2] : [];
  const selectedCategory = filled ? "baby" : "";
  const selectedCondition = filled ? "used" : "";

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.marketCreateRoot}>
        <View style={styles.marketCreateTopBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.marketCreateClose}
          >
            <MaterialIcons
              name="close"
              size={22}
              color={theme.colors.inkSoft}
            />
            <Text style={styles.marketCreateCloseText}>닫기</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.marketCreateTopTitle}>
            {isEdit ? "나눔 수정" : "나눔 등록"}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={!filled}
            style={styles.marketCreateTopAction}
          >
            <Text
              style={[
                styles.marketCreateTopActionText,
                filled ? styles.marketCreateTopActionTextEnabled : null,
              ]}
            >
              {isEdit ? "저장" : "등록"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.marketCreateScroll}
          contentContainerStyle={styles.marketCreateScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.marketCreatePhotoSection}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.marketCreatePhotoRail}
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.marketCreatePhotoAdd}>
                <MaterialIcons
                  name="photo-camera"
                  size={22}
                  color={theme.colors.inkMute}
                />
                <Text style={styles.marketCreatePhotoAddText}>
                  사진 {photos.length}/5
                </Text>
              </View>
              {photos.map((photo, index) => (
                <View key={photo} style={styles.marketCreatePhotoThumbWrap}>
                  <VisualThumb
                    size={90}
                    seed={photo}
                    style={styles.marketCreatePhotoThumb}
                  />
                  {index === 0 ? (
                    <View style={styles.marketCreateRepBadge}>
                      <Text style={styles.marketCreateRepText}>대표</Text>
                    </View>
                  ) : null}
                  <View style={styles.marketCreatePhotoRemove}>
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </View>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.marketCreatePhotoHint}>
              최대 5장, JPG/PNG/WEBP, 5MB 이하
            </Text>
          </View>

          <MarketCreateDivider />

          <MarketCreateSection label="카테고리" required>
            <View style={styles.marketCreateChipWrap}>
              {marketCreateCategories.map((category) => {
                const active = category.key === selectedCategory;
                return (
                  <View
                    key={category.key}
                    style={[
                      styles.marketCreateChip,
                      active ? styles.marketCreateChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.marketCreateChipText,
                        active ? styles.marketCreateChipTextActive : null,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </MarketCreateSection>

          <MarketCreateDivider />

          <MarketCreateSection
            label="제목"
            required
            hint={`${title.length}/30`}
          >
            <View style={styles.marketCreateInput}>
              <Text
                numberOfLines={1}
                ellipsizeMode="clip"
                style={[
                  styles.marketCreateInputText,
                  !title ? styles.marketCreatePlaceholder : null,
                ]}
              >
                {title || "제목을 입력해주세요 (최대 30자)"}
              </Text>
            </View>
          </MarketCreateSection>

          <MarketCreateDivider />

          <MarketCreateSection label="물품 상태" required>
            <View style={styles.marketCreateConditionRow}>
              {[
                { value: "new", label: "새것" },
                { value: "used", label: "사용감 있음" },
                { value: "damaged", label: "파손 있음" },
              ].map((condition) => {
                const active = condition.value === selectedCondition;
                return (
                  <View
                    key={condition.value}
                    style={[
                      styles.marketCreateCondition,
                      active ? styles.marketCreateConditionActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.marketCreateConditionText,
                        active ? styles.marketCreateConditionTextActive : null,
                      ]}
                    >
                      {condition.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </MarketCreateSection>

          <MarketCreateDivider />

          <MarketCreateSection
            label="상세 설명"
            required
            hint={`${description.length}/500`}
          >
            <View style={styles.marketCreateTextarea}>
              <Text
                style={[
                  styles.marketCreateTextareaText,
                  !description ? styles.marketCreatePlaceholder : null,
                ]}
              >
                {description ||
                  "물품 상태, 수령 방법, 일정 등을 자세히 적어주세요"}
              </Text>
            </View>
          </MarketCreateSection>

          <View style={styles.marketCreateInfoBox}>
            <View style={styles.marketCreateInfoIcon}>
              <MaterialIcons
                name="info"
                size={16}
                color={theme.colors.primaryDeep}
              />
            </View>
            <Text style={styles.marketCreateInfoText}>
              직거래 시 안전한 장소(교회 로비 등)에서 만나주세요.
            </Text>
          </View>
        </ScrollView>
      </View>

      <ConfirmDialog
        visible={variant === "back-warn"}
        title="작성을 중단하시겠습니까?"
        message="작성 중인 내용이 사라지며 복구할 수 없어요."
        cancelText="계속 작성"
        confirmText="나가기"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast
        message={
          variant === "limit-toast"
            ? "하루에 나눔은 5개까지 등록할 수 있어요"
            : ""
        }
      />
    </Screen>
  );
}

function MarketCreateDivider() {
  return <View style={styles.marketCreateDivider} />;
}

function MarketCreateSection({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.marketCreateSection}>
      <View style={styles.marketCreateSectionHeader}>
        <View style={styles.marketCreateSectionLabelRow}>
          <Text style={styles.marketCreateSectionLabel}>{label}</Text>
          {required ? <Text style={styles.marketCreateRequired}>*</Text> : null}
        </View>
        {hint ? <Text style={styles.marketCreateHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
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
  const isMember =
    variant === "member" ||
    variant === "leave-confirm" ||
    variant === "leader-leave-toast";
  const members = [
    isLeader ? "김은혜" : "한지수",
    "박정아",
    "이수진",
    "김지영",
    "정혜진",
    "조미경",
  ];

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.detailTopPad}>
        <TopBar title="소모임" back onBack={() => router.back()} />
      </View>
      <ScrollView
        contentContainerStyle={styles.groupDetailScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.groupDetailHeader}>
          <View style={styles.inlineMeta}>
            <View style={styles.groupCategoryChip}>
              <Text style={styles.groupCategoryChipText}>운동·건강</Text>
            </View>
            <Badge tone={isClosed ? "mute" : "success"}>
              {isClosed ? "모집완료" : "모집중"}
            </Badge>
          </View>
          <Text style={styles.groupDetailTitle}>토요 산악회</Text>
          <View style={styles.groupMetaRow}>
            <MaterialIcons
              name="groups"
              size={14}
              color={theme.colors.inkSoft}
            />
            <Text style={styles.groupMetaText}>
              현재 <Text style={styles.primaryText}>{isClosed ? 25 : 18}</Text>{" "}
              / 최대 25
            </Text>
          </View>
          <Text style={styles.bodyText}>
            매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.
            {"\n"}
            등산 초보도 환영해요. 등산화·물·간식만 챙겨오시면 돼요.{"\n"}
            모임 일정과 코스는 매주 화요일 공지로 안내드립니다.
          </Text>
          <View style={styles.groupLeaderCard}>
            <Avatar name={isLeader ? "김은혜" : "한지수"} size={36} />
            <View style={styles.flex}>
              <Text style={styles.metaText}>소모임장</Text>
              <Text style={styles.cardTitle}>
                {isLeader ? "김은혜" : "한지수"}
              </Text>
            </View>
            <View style={styles.groupLeaderBadge}>
              <Text style={styles.groupLeaderBadgeText}>소모임장</Text>
            </View>
          </View>
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
            <View style={styles.groupOutlineAction}>
              <Text style={styles.groupOutlineActionText}>탈퇴하기</Text>
            </View>
          ) : (
            <View
              style={[
                styles.groupPrimaryAction,
                isClosed ? styles.groupPrimaryActionDisabled : null,
              ]}
            >
              <Text style={styles.groupPrimaryActionText}>
                {isClosed ? "모집이 마감됐어요" : "참여 신청하기"}
              </Text>
            </View>
          )}
        </View>

        <GroupDetailSectionHeader title={`멤버 ${members.length}명`} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberRail}
        >
          {members.map((member, index) => (
            <View key={member} style={styles.memberMini}>
              <View style={styles.memberAvatarWrap}>
                <Avatar name={member} size={48} />
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
        </ScrollView>

        <GroupDetailSectionHeader title="공지사항" />
        <View style={styles.groupNoticeList}>
          <GroupNoticeCard
            title="5월 18일 토요일 모임 안내"
            preview="이번 주 토요일은 북한산 도선사 코스로 갑니다. 오전 7시 교회 앞에서 모입니다."
            when="2일 전"
            leader={isLeader}
          />
          <GroupNoticeCard
            title="신규 멤버 환영합니다"
            preview="이번 달에 새로 합류해주신 분들 진심으로 환영해요. 다음 모임 때 소개 시간이 있을 예정입니다."
            when="1주 전"
            edited
            leader={isLeader}
          />
        </View>
      </ScrollView>
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
            ? "인원이 꽉 찼습니다"
            : variant === "leader-leave-toast"
              ? "소모임장은 탈퇴할 수 없어요. 먼저 이관해주세요"
              : ""
        }
      />
    </Screen>
  );
}

function GroupDetailSectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.groupSectionHeader}>
      <Text style={styles.groupSectionTitle}>{title}</Text>
    </View>
  );
}

function GroupNoticeCard({
  title,
  preview,
  when,
  edited,
  leader,
}: {
  title: string;
  preview: string;
  when: string;
  edited?: boolean;
  leader?: boolean;
}) {
  return (
    <Card style={styles.groupNoticeCard}>
      <View style={styles.groupNoticeTitleRow}>
        <Text style={styles.groupNoticeTitle}>{title}</Text>
        {edited ? <Text style={styles.groupNoticeEdited}>수정됨</Text> : null}
      </View>
      <Text numberOfLines={2} style={styles.groupNoticePreview}>
        {preview}
      </Text>
      <Text style={styles.metaText}>{when}</Text>
      {leader ? (
        <View style={styles.groupNoticeActions}>
          <View style={styles.commentMiniAction}>
            <MaterialIcons name="edit" size={14} color={theme.colors.inkMute} />
            <Text style={styles.commentMiniActionText}>수정</Text>
          </View>
          <View style={styles.commentMiniAction}>
            <MaterialIcons
              name="delete-outline"
              size={14}
              color={theme.colors.danger}
            />
            <Text
              style={[
                styles.commentMiniActionText,
                styles.commentMiniActionDanger,
              ]}
            >
              삭제
            </Text>
          </View>
        </View>
      ) : null}
    </Card>
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

type FaithSection = "pray" | "study";

const faithSegmentItems = [
  { key: "pray", label: "중보기도" },
  { key: "study", label: "삶공부" },
] as const;

export function PrayerListReferenceScreen({
  testID = "screen-prayer",
  onSectionChange,
}: {
  testID?: string;
  onSectionChange?: (section: FaithSection) => void;
} = {}) {
  return (
    <Screen padded={false}>
      <TopBar
        testID={testID}
        title="동행"
        subtitle="기도로 동행하고, 말씀으로 자라가요"
        right={
          <MaterialIcons name="search" size={22} color={theme.colors.inkSoft} />
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={faithSegmentItems}
          active="pray"
          onChange={onSectionChange ?? (() => undefined)}
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

export function StudyListReferenceScreen({
  testID = "screen-life-study",
  onSectionChange,
}: {
  testID?: string;
  onSectionChange?: (section: FaithSection) => void;
} = {}) {
  return (
    <Screen padded={false}>
      <TopBar
        testID={testID}
        title="동행"
        subtitle="기도로 동행하고, 말씀으로 자라가요"
        right={
          <MaterialIcons name="search" size={22} color={theme.colors.inkSoft} />
        }
      />
      <View style={styles.segmentWrap}>
        <SegmentedTabs
          items={faithSegmentItems}
          active="study"
          onChange={onSectionChange ?? (() => undefined)}
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
  const blockedUsers = empty
    ? []
    : [
        { name: "이모씨", when: "2025.11.20", seed: 1 },
        { name: "박모씨", when: "2025.09.04", seed: 3 },
        { name: "정모씨", when: "2025.06.15", seed: 5 },
      ];
  const visibleUsers =
    variant === "toast" ? blockedUsers.slice(1) : blockedUsers;

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="차단 사용자" back onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.blockedBody}
        showsVerticalScrollIndicator={false}
      >
        {!empty ? (
          <View style={styles.blockedNotice}>
            <Text style={styles.blockedNoticeText}>
              차단된 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의
              활동을 볼 수 없습니다.
            </Text>
          </View>
        ) : null}
        <View style={styles.blockedList}>
          {visibleUsers.length === 0 ? (
            <View style={styles.blockedEmpty}>
              <View style={styles.blockedEmptyIcon}>
                <MaterialIcons
                  name="block"
                  size={38}
                  color={theme.colors.inkHint}
                />
              </View>
              <Text style={styles.blockedEmptyTitle}>
                차단한 사용자가 없습니다
              </Text>
              <Text style={styles.blockedEmptyText}>
                프로필 화면에서 언제든지{"\n"}상대를 차단할 수 있어요.
              </Text>
            </View>
          ) : (
            visibleUsers.map((user, index) => (
              <View
                key={user.name}
                style={[
                  styles.blockedRow,
                  index === visibleUsers.length - 1 ? styles.noBorder : null,
                ]}
              >
                <Avatar name={user.name} size={42} seed={user.seed} />
                <View style={styles.flex}>
                  <Text style={styles.blockedName}>{user.name}</Text>
                  <Text style={styles.blockedDate}>{user.when} 차단</Text>
                </View>
                <View style={styles.blockedReleaseButton}>
                  <MaterialIcons
                    name="check"
                    size={14}
                    color={theme.colors.primaryDeep}
                  />
                  <Text style={styles.blockedReleaseText}>차단 해제</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={variant === "confirm"}
        title="이모씨님의 차단을 해제할까요?"
        message="해제 후에는 상대의 게시글과 댓글이 다시 보이며, 상대도 회원님의 활동을 볼 수 있게 됩니다."
        confirmText="차단 해제"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast message={variant === "toast" ? "차단이 해제되었습니다" : ""} />
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
      <Screen scroll={false} padded={false}>
        <TopBar title="프로필" back onBack={() => router.back()} />
        <View style={styles.userBlockedBody}>
          <View style={styles.userBlockedIcon}>
            <MaterialIcons
              name="block"
              size={38}
              color={theme.colors.inkHint}
            />
          </View>
          <Text style={styles.userBlockedTitle}>
            확인할 수 없는 프로필입니다
          </Text>
          <Text style={styles.userBlockedText}>
            차단한 사용자의 프로필은 볼 수 없어요.{"\n"}마이페이지 &gt; 차단
            사용자 관리에서 해제할 수 있어요.
          </Text>
        </View>
      </Screen>
    );
  }

  const withdrawn = variant === "withdrawn";

  return (
    <Screen scroll={false} padded={false}>
      <TopBar title="프로필" back onBack={() => router.back()} />
      <View style={styles.userProfileBody}>
        <View
          style={[
            styles.userProfileAvatar,
            withdrawn ? styles.userProfileAvatarWithdrawn : null,
          ]}
        >
          <Text
            style={[
              styles.userProfileInitial,
              withdrawn ? styles.userProfileInitialWithdrawn : null,
            ]}
          >
            {withdrawn ? "?" : "정아"}
          </Text>
        </View>
        <Text
          style={[
            styles.userProfileName,
            withdrawn ? styles.userProfileNameWithdrawn : null,
          ]}
        >
          {withdrawn ? "알 수 없음" : "박정아"}
        </Text>
        {withdrawn ? (
          <Text style={styles.userProfileSub}>탈퇴한 사용자</Text>
        ) : null}
      </View>
      {!withdrawn ? (
        <View style={styles.userProfileActionWrap}>
          <View style={styles.userProfileBlockButton}>
            <MaterialIcons
              name="block"
              size={18}
              color={theme.colors.inkSoft}
            />
            <Text style={styles.userProfileBlockText}>차단</Text>
          </View>
        </View>
      ) : null}
      <ConfirmDialog
        visible={variant === "block-confirm"}
        title="박정아님을 차단할까요?"
        message="차단한 사용자의 게시글과 댓글은 보이지 않으며, 상대도 회원님의 활동을 볼 수 없어요."
        confirmText="차단"
        danger
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast message={variant === "block-toast" ? "차단되었습니다" : ""} />
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

const legalText = `제1조 (목적)
본 약관은 열린문커넥트(이하 "서비스")가 제공하는 모바일 애플리케이션 및 관련 제반 서비스의 이용과 관련하여 회사와 회원의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.
2. "콘텐츠"란 회원이 서비스에 게시한 글, 사진, 댓글 등을 의미합니다.
3. "교회 커뮤니티"란 동일 교회 소속 회원으로 구성된 폐쇄형 그룹을 말합니다.

제3조 (약관의 효력 및 변경)
본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.

제4조 (회원가입)
회원이 되고자 하는 자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.

제5조 (서비스의 제공 및 변경)
회사는 교회 내 나눔 플랫폼, 소모임 개설 및 참여, 중보기도 모임, 삶공부 과정 안내 및 수강 신청을 제공합니다.`;

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

const marketCreateCategories = [
  { key: "cloth", label: "의류·잡화" },
  { key: "home", label: "가전·가구" },
  { key: "book", label: "도서·문구" },
  { key: "life", label: "식품·생활품" },
  { key: "baby", label: "유아·아동용품" },
  { key: "sport", label: "스포츠·취미" },
  { key: "etc", label: "기타" },
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
  inviteRoot: { flex: 1 },
  inviteBody: { paddingHorizontal: 24 },
  inviteIntro: { marginTop: 6 },
  inviteDisplay: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: "900",
  },
  inviteDescription: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  inviteFieldBlock: { marginTop: 32 },
  inviteLabel: {
    marginBottom: 6,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  inviteInput: {
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  inviteInputError: {
    borderColor: theme.colors.danger,
    backgroundColor: "#FDF4F1",
  },
  inviteInputText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  inviteHint: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: 12,
    lineHeight: 17,
  },
  inviteError: {
    marginTop: 6,
    color: theme.colors.danger,
    fontSize: 12,
    lineHeight: 17,
  },
  inviteHelpCard: {
    marginTop: 28,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
  },
  inviteHelpText: {
    flex: 1,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  inviteSpacer: { flex: 1 },
  inviteBottomFlat: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  termsRoot: { flex: 1, position: "relative", overflow: "hidden" },
  termsBase: { flex: 1 },
  termsDimmedContent: { opacity: 0.5 },
  termsBody: { paddingHorizontal: 24 },
  termsDisplay: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.display,
    lineHeight: theme.lineHeight.display,
    fontWeight: "900",
  },
  termsDescription: {
    marginTop: 10,
    color: theme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  termsAgreeAll: {
    marginTop: 28,
    minHeight: 60,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface,
  },
  termsCheckLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
  },
  termsAgreeAllText: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  termsList: { marginTop: 8, paddingHorizontal: 4, paddingVertical: 4 },
  termsRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  termsCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
  },
  termsRowTextWrap: { flex: 1, minWidth: 0 },
  termsRowText: { color: theme.colors.ink, fontSize: 14, lineHeight: 20 },
  termsRequired: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.semibold,
  },
  termsViewFull: { flexDirection: "row", alignItems: "center", gap: 2 },
  termsViewFullText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    textDecorationLine: "underline",
  },
  termsBottomFlat: {
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  termsNextButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    opacity: 0.4,
  },
  termsNextText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  termsSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    justifyContent: "flex-end",
  },
  termsSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.sheetOverlay,
  },
  termsSheetPanel: {
    height: "85%",
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: "hidden",
    backgroundColor: theme.colors.bg,
    ...theme.shadow.sheet,
  },
  termsSheetHandleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  termsSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.lineStrong,
  },
  termsSheetHeader: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  termsSheetTitle: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: "900",
  },
  termsSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  termsSheetScroll: { flexShrink: 1 },
  termsSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 28,
  },
  termsSheetDate: {
    marginBottom: 10,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  termsSheetText: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 23.5,
  },
  stack: { gap: 12 },
  sheetField: { marginTop: 14 },
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 8 },
  routeList: { gap: 12, paddingHorizontal: 18 },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  marketDetailScroll: {
    paddingBottom: 100,
  },
  marketHero: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#E2DED3",
  },
  marketHeroCover: {
    width: "100%",
    height: "100%",
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
  marketComments: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 12,
  },
  marketCommentsTitle: {
    paddingVertical: 8,
    marginBottom: 4,
    color: theme.colors.inkMute,
    fontSize: 13,
    fontWeight: "800",
  },
  marketCommentRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    flexDirection: "row",
    gap: 10,
  },
  commentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAuthor: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: "800",
  },
  commentEdited: {
    color: theme.colors.inkHint,
    fontSize: 11,
    fontWeight: "600",
  },
  commentDeleted: {
    marginTop: 4,
    color: theme.colors.inkHint,
    fontSize: 13.5,
    fontStyle: "italic",
  },
  commentBody: {
    marginTop: 4,
    color: theme.colors.ink,
    fontSize: 13.5,
    lineHeight: 20,
  },
  commentActions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 12,
  },
  commentMiniAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentMiniActionText: {
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "700",
  },
  commentMiniActionDanger: {
    color: theme.colors.danger,
  },
  marketComposerPreview: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 84,
    zIndex: 29,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: "rgba(255,255,255,0.96)",
    ...theme.shadow.float,
  },
  marketComposerPreviewText: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 22,
  },
  marketComposerPreviewCount: {
    position: "absolute",
    right: 14,
    bottom: 8,
    color: theme.colors.inkHint,
    fontSize: 11,
    fontWeight: "700",
  },
  marketComposerPreviewTail: {
    position: "absolute",
    left: 24,
    bottom: -6,
    width: 12,
    height: 12,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: "rgba(255,255,255,0.96)",
    transform: [{ rotate: "45deg" }],
  },
  marketComposerBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    zIndex: 30,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radius.pill,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.glass,
    ...theme.shadow.float,
  },
  marketComposerInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,30,18,0.05)",
  },
  marketComposerText: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.inkSoft,
    fontSize: 14,
  },
  marketComposerPlaceholder: {
    color: theme.colors.inkMute,
  },
  marketComposerCount: {
    marginLeft: 8,
    color: theme.colors.inkHint,
    fontSize: 11,
    fontWeight: "700",
  },
  marketComposerButton: {
    height: 48,
    minWidth: 64,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.05)",
  },
  marketComposerButtonActive: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  marketComposerButtonText: {
    color: theme.colors.inkMute,
    fontSize: 14,
    fontWeight: "800",
  },
  marketComposerButtonTextActive: {
    color: theme.colors.white,
  },
  marketCreateRoot: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  marketCreateTopBar: {
    minHeight: 52,
    paddingHorizontal: 18,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface,
  },
  marketCreateClose: {
    minWidth: 72,
    minHeight: 36,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(20,30,18,0.05)",
  },
  marketCreateCloseText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  marketCreateTopTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  marketCreateTopAction: {
    minWidth: 72,
    minHeight: 36,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  marketCreateTopActionText: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: theme.colors.inkHint,
    fontSize: 14,
    fontWeight: "800",
  },
  marketCreateTopActionTextEnabled: {
    color: theme.colors.primary,
  },
  marketCreateScroll: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  marketCreateScrollContent: {
    paddingBottom: 22,
  },
  marketCreatePhotoSection: {
    paddingTop: 6,
    paddingBottom: 18,
  },
  marketCreatePhotoRail: {
    paddingHorizontal: 22,
    paddingVertical: 4,
    gap: 10,
  },
  marketCreatePhotoAdd: {
    width: 90,
    height: 90,
    flexShrink: 0,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.surface2,
  },
  marketCreatePhotoAddText: {
    color: theme.colors.inkMute,
    fontSize: 11,
    fontWeight: "800",
  },
  marketCreatePhotoThumbWrap: {
    position: "relative",
    width: 90,
    height: 90,
    flexShrink: 0,
  },
  marketCreatePhotoThumb: {
    borderRadius: theme.radius.md,
  },
  marketCreateRepBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.primary,
  },
  marketCreateRepText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  marketCreatePhotoRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.70)",
  },
  marketCreatePhotoHint: {
    paddingHorizontal: 22,
    paddingTop: 8,
    color: theme.colors.inkHint,
    fontSize: 11.5,
    lineHeight: 16,
  },
  marketCreateDivider: {
    height: 8,
    backgroundColor: theme.colors.bg,
  },
  marketCreateSection: {
    paddingVertical: 14,
  },
  marketCreateSectionHeader: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  marketCreateSectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  marketCreateSectionLabel: {
    color: theme.colors.ink,
    fontSize: 13.5,
    fontWeight: "800",
  },
  marketCreateRequired: {
    color: theme.colors.primary,
    fontSize: 13.5,
    fontWeight: "800",
  },
  marketCreateHint: {
    color: theme.colors.inkHint,
    fontSize: 11.5,
    fontWeight: "700",
  },
  marketCreateChipWrap: {
    paddingHorizontal: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  marketCreateChip: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  marketCreateChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  marketCreateChipText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "700",
  },
  marketCreateChipTextActive: {
    color: theme.colors.primaryDeep,
    fontWeight: "800",
  },
  marketCreateInput: {
    height: 48,
    marginHorizontal: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
  },
  marketCreateInputText: {
    color: theme.colors.ink,
    fontSize: 14,
    fontWeight: "500",
  },
  marketCreatePlaceholder: {
    color: theme.colors.inkHint,
  },
  marketCreateConditionRow: {
    paddingHorizontal: 22,
    flexDirection: "row",
    gap: 8,
  },
  marketCreateCondition: {
    flex: 1,
    height: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  marketCreateConditionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  marketCreateConditionText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: "600",
  },
  marketCreateConditionTextActive: {
    color: theme.colors.primaryDeep,
    fontWeight: "800",
  },
  marketCreateTextarea: {
    minHeight: 154,
    marginHorizontal: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface2,
  },
  marketCreateTextareaText: {
    color: theme.colors.ink,
    fontSize: 14,
    lineHeight: 22.4,
  },
  marketCreateInfoBox: {
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 22,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: theme.colors.primarySoft,
  },
  marketCreateInfoIcon: {
    marginTop: 2,
  },
  marketCreateInfoText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: 13,
    lineHeight: 19.5,
  },
  detailTopPad: {
    paddingHorizontal: 0,
  },
  groupDetailScroll: {
    paddingBottom: 16,
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
  groupMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupCategoryChip: {
    minHeight: 26,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
    backgroundColor: theme.colors.primaryTint,
  },
  groupCategoryChipText: {
    color: theme.colors.primaryDeep,
    fontSize: 11.5,
    fontWeight: "800",
  },
  groupMetaText: {
    color: theme.colors.inkSoft,
    fontSize: 14,
    fontWeight: "700",
  },
  groupLeaderCard: {
    marginTop: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.ring,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface2,
    ...theme.shadow.card,
  },
  groupLeaderBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary,
  },
  groupLeaderBadgeText: {
    color: theme.colors.white,
    fontSize: 10.5,
    fontWeight: "800",
  },
  groupActionWrap: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  groupPrimaryAction: {
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  groupPrimaryActionDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.lineStrong,
    shadowOpacity: 0,
    elevation: 0,
  },
  groupPrimaryActionText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  groupOutlineAction: {
    height: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  groupOutlineActionText: {
    color: theme.colors.inkSoft,
    fontSize: 14,
    fontWeight: "700",
  },
  groupSectionHeader: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
  },
  groupSectionTitle: {
    color: theme.colors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  memberRail: {
    paddingHorizontal: 22,
    paddingBottom: 12,
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
  groupNoticeCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupNoticeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupNoticeTitle: {
    flexShrink: 1,
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: "800",
  },
  groupNoticeEdited: {
    color: theme.colors.inkHint,
    fontSize: 11,
    fontWeight: "700",
  },
  groupNoticePreview: {
    marginTop: 6,
    color: theme.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  groupNoticeActions: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    flexDirection: "row",
    gap: 14,
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
  blockedBody: {
    paddingBottom: 28,
  },
  blockedNotice: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "rgba(91,122,176,0.10)",
  },
  blockedNoticeText: {
    color: theme.colors.primaryDeep,
    fontSize: 13,
    lineHeight: 20,
  },
  blockedList: {
    paddingHorizontal: 18,
  },
  blockedRow: {
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  blockedName: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: "800",
  },
  blockedDate: {
    marginTop: 2,
    color: theme.colors.inkMute,
    fontSize: 13,
    lineHeight: 18,
  },
  blockedReleaseButton: {
    height: 34,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
  },
  blockedReleaseText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800",
  },
  blockedEmpty: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: "center",
  },
  blockedEmptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
  },
  blockedEmptyTitle: {
    color: theme.colors.inkSoft,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  blockedEmptyText: {
    marginTop: 8,
    color: theme.colors.inkMute,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  userBlockedBody: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  userBlockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
  },
  userBlockedTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  userBlockedText: {
    marginTop: 10,
    color: theme.colors.inkMute,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },
  userProfileBody: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: "center",
  },
  userProfileAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  userProfileAvatarWithdrawn: {
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
    shadowOpacity: 0,
    elevation: 0,
  },
  userProfileInitial: {
    color: theme.colors.white,
    fontSize: 36,
    fontWeight: "900",
  },
  userProfileInitialWithdrawn: {
    color: theme.colors.inkHint,
  },
  userProfileName: {
    marginTop: 18,
    color: theme.colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  userProfileNameWithdrawn: {
    color: theme.colors.inkMute,
  },
  userProfileSub: {
    marginTop: 6,
    color: theme.colors.inkMute,
    fontSize: 13,
  },
  userProfileActionWrap: {
    paddingHorizontal: 24,
  },
  userProfileBlockButton: {
    height: 52,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  userProfileBlockText: {
    color: theme.colors.inkSoft,
    fontSize: 14,
    fontWeight: "700",
  },
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
