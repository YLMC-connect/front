import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { CommentBubble } from "../comment-bubble";

describe("CommentBubble", () => {
  it("renders a flat comment with name, time and body", () => {
    render(
      <CommentBubble name="김민수" time="3분 전" testID="comment">
        아직 나눔 가능한가요?
      </CommentBubble>,
    );

    expect(screen.getByText("김민수")).toBeTruthy();
    expect(screen.getByText("아직 나눔 가능한가요?")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByText("3분 전").props.style),
    ).toMatchObject({ fontSize: 12, color: theme.colors.textMuted });
    const row = StyleSheet.flatten(screen.getByTestId("comment").props.style);
    expect(row).toMatchObject({ marginBottom: 20 });
    expect(row.backgroundColor).toBeUndefined();
    expect(row.borderWidth).toBeUndefined();
  });

  it("hides reply, delete, like and menu when no callbacks are given", () => {
    render(
      <CommentBubble name="김민수" time="방금" mine>
        본문
      </CommentBubble>,
    );

    expect(screen.queryByText("답글 달기")).toBeNull();
    expect(screen.queryByText("삭제")).toBeNull();
    expect(screen.queryByLabelText("좋아요")).toBeNull();
    expect(screen.queryByLabelText("댓글 메뉴")).toBeNull();
  });

  it("shows delete only on my comment", () => {
    const onDelete = jest.fn();
    const { rerender } = render(
      <CommentBubble name="김민수" time="방금" onDelete={onDelete}>
        본문
      </CommentBubble>,
    );
    expect(screen.queryByLabelText("댓글 삭제")).toBeNull();

    rerender(
      <CommentBubble name="김민수" time="방금" mine onDelete={onDelete}>
        본문
      </CommentBubble>,
    );
    fireEvent.press(screen.getByLabelText("댓글 삭제"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows the author badge, reply action, like and menu when provided", () => {
    const onReply = jest.fn();
    const onLike = jest.fn();
    const onMore = jest.fn();
    render(
      <CommentBubble
        name="이영희"
        time="1시간 전"
        author
        liked
        onReply={onReply}
        onLike={onLike}
        onMore={onMore}
        testID="comment"
      >
        네 가능해요
      </CommentBubble>,
    );

    expect(screen.getByText("작성자")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("comment-author").props.style),
    ).toMatchObject({ backgroundColor: theme.colors.primarySubtle });

    fireEvent.press(screen.getByText("답글 달기"));
    fireEvent.press(screen.getByLabelText("좋아요 취소"));
    fireEvent.press(screen.getByLabelText("댓글 메뉴"));
    expect(onReply).toHaveBeenCalledTimes(1);
    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onMore).toHaveBeenCalledTimes(1);
  });

  it("indents a reply one level", () => {
    render(
      <CommentBubble name="이영희" time="방금" reply testID="reply">
        답글
      </CommentBubble>,
    );

    expect(
      StyleSheet.flatten(screen.getByTestId("reply").props.style),
    ).toMatchObject({ paddingLeft: 48 });
  });
});
