import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen, Section } from "../layout/Screen";
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  HorizontalChips,
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
      <View style={styles.floatButton}>
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={styles.floatButtonText}>글쓰기</Text>
      </View>
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
  const isOwn =
    variant.startsWith("own") ||
    variant === "status" ||
    variant === "delete-confirm";
  const showReport = variant === "report" || variant === "report-other-input";

  return (
    <Screen>
      <TopBar title="나눔 상세" back onBack={() => router.back()} />
      <VisualCover height={210} seed={2} label="나눔 사진" />
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>아이 장난감 정리하면서 나눔합니다</Text>
        {status !== "sharing" ? (
          <Badge tone={status === "reserved" ? "warn" : "mute"}>
            {status === "reserved" ? "예약중" : "나눔완료"}
          </Badge>
        ) : null}
      </View>
      <Card style={styles.rowCard}>
        <Avatar name={isOwn ? "김은혜" : "박정아"} />
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>{isOwn ? "김은혜" : "박정아"}</Text>
          <Text style={styles.metaText}>본당 1층 로비 · 사용감 적음</Text>
        </View>
      </Card>
      <Text style={styles.bodyText}>
        아이가 커서 사용하지 않는 블록과 인형을 정리합니다. 필요하신 분께
        전달드리고 싶어요.
      </Text>
      <View style={styles.actions}>
        {isOwn ? (
          <Button variant="soft">상태 변경</Button>
        ) : (
          <Button>관심</Button>
        )}
        {isOwn ? (
          <Button variant="ghost">수정</Button>
        ) : (
          <Button variant="ghost">신고</Button>
        )}
      </View>
      <Card style={styles.stack}>
        <Text style={styles.cardTitle}>댓글 2</Text>
        <Text style={styles.bodyText}>오늘 저녁 예배 후 받을 수 있을까요?</Text>
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
      <BottomSheet
        visible={variant === "status"}
        title="나눔 상태 변경"
        onClose={() => undefined}
      >
        <View style={styles.stack}>
          <Button variant="soft">나눔중</Button>
          <Button variant="soft">예약중</Button>
          <Button>나눔완료</Button>
        </View>
      </BottomSheet>
      <BottomSheet
        visible={showReport}
        title="신고 사유 선택"
        onClose={() => undefined}
      >
        <View style={styles.stack}>
          <Button variant="soft">상업성 게시글</Button>
          <Button variant="soft">부적절한 내용</Button>
          <Button variant="soft">기타</Button>
          {variant === "report-other-input" ? (
            <Textarea value="직접 거래를 유도합니다." />
          ) : null}
        </View>
      </BottomSheet>
      <ConfirmDialog
        visible={variant === "delete-confirm"}
        title="나눔 글을 삭제할까요?"
        message="삭제된 게시글은 다시 복구할 수 없습니다."
        confirmText="삭제"
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
      <View style={styles.floatButton}>
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={styles.floatButtonText}>개설</Text>
      </View>
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

  return (
    <Screen>
      <TopBar title="소모임 상세" back onBack={() => router.back()} />
      <VisualCover height={190} seed={4} label="토요 산악회" />
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>토요 산악회</Text>
        <Badge tone={isClosed ? "mute" : "success"}>
          {isClosed ? "모집완료" : "모집중"}
        </Badge>
      </View>
      <Text style={styles.bodyText}>
        매주 토요일 함께 산을 오르며 자연을 느끼고 신앙을 나누는 모임입니다.
      </Text>
      <Card style={styles.stack}>
        <InfoRow label="일정" value="매주 토요일 오전 7시" />
        <InfoRow label="장소" value="교회 정문 출발" />
        <InfoRow label="인원" value={`${isClosed ? 25 : 18} / 25명`} />
      </Card>
      <View style={styles.actions}>
        {isLeader ? (
          <>
            <Button variant="soft">수정</Button>
            <Button variant="ghost">멤버 관리</Button>
          </>
        ) : isMember ? (
          <Button variant="soft">탈퇴하기</Button>
        ) : (
          <Button disabled={isClosed}>참여 신청</Button>
        )}
        <Button variant="ghost">관심</Button>
      </View>
      <Card style={styles.stack}>
        <Text style={styles.cardTitle}>공지사항</Text>
        <Text style={styles.bodyText}>
          이번 주는 북한산 도선사 코스로 갑니다.
        </Text>
      </Card>
      <ConfirmDialog
        visible={variant === "apply-confirm"}
        title="소모임에 참여할까요?"
        confirmText="신청"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <ConfirmDialog
        visible={variant === "leave-confirm"}
        title="소모임에서 나갈까요?"
        confirmText="탈퇴"
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <ConfirmDialog
        visible={variant === "delete-confirm"}
        title="소모임을 삭제할까요?"
        message="삭제된 소모임은 복구할 수 없습니다."
        confirmText="삭제"
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
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    </Screen>
  );
}

export function GroupMembersReferenceScreen({ variant }: { variant: string }) {
  return (
    <Screen>
      <TopBar title="멤버 관리" back onBack={() => router.back()} />
      <Card style={styles.summaryBanner}>
        <Text style={styles.cardTitle}>토요 산악회</Text>
        <Text style={styles.bodyText}>현재 18명 / 최대 25명</Text>
      </Card>
      <View style={styles.stack}>
        {["김은혜", "박정아", "이수진", "김지영", "정혜진"].map(
          (name, index) => (
            <Card key={name} style={styles.rowCard}>
              <Avatar name={name} size={42} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={styles.metaText}>
                  {index === 0 ? "소모임장" : "멤버"}
                </Text>
              </View>
              <Badge tone={index === 0 ? "primary" : "mute"}>
                {index === 0 ? "리더" : "관리"}
              </Badge>
            </Card>
          ),
        )}
      </View>
      {variant === "transfer" ? <Button>소모임장 이관</Button> : null}
      <ConfirmDialog
        visible={variant === "kick-confirm" || variant === "transfer-confirm"}
        title={
          variant === "transfer-confirm"
            ? "소모임장을 이관할까요?"
            : "멤버를 내보낼까요?"
        }
        confirmText={variant === "transfer-confirm" ? "이관" : "내보내기"}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
      <Toast message={variant === "kick-toast" ? "멤버를 내보냈습니다." : ""} />
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
        title="차단을 해제할까요?"
        confirmText="해제"
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
          "탈퇴 후 기존 데이터는 복구할 수 없습니다",
          "소모임장인 경우 먼저 가입한 멤버에게 자동 이관됩니다",
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
        message="이 작업은 되돌릴 수 없습니다."
        confirmText="탈퇴"
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
        title="사용자를 차단할까요?"
        confirmText="차단"
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
  segmentWrap: { paddingHorizontal: 18, paddingBottom: 8 },
  routeList: { gap: 12, paddingHorizontal: 18 },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  floatButton: {
    position: "absolute",
    right: 16,
    bottom: 94,
    zIndex: 20,
    height: 52,
    borderRadius: theme.radius.pill,
    paddingLeft: 16,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
  },
  floatButtonText: { color: "#fff", fontSize: 14, fontWeight: "900" },
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
});
