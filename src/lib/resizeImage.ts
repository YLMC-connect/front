import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

export const UPLOAD_IMAGE_MAX_SIDE = 1600;
export const UPLOAD_IMAGE_QUALITY = 0.8;

/**
 * 업로드용으로 사진을 줄인다. 긴 변이 1600px 보다 크면 1600px 로 줄이고,
 * 작으면 크기는 그대로 둔 채 JPEG(품질 0.8)로만 다시 저장한다.
 * 변환에 실패하면 원본 uri 를 그대로 돌려준다.
 */
export async function resizeImageForUpload(uri: string): Promise<string> {
  try {
    const original = await ImageManipulator.manipulate(uri).renderAsync();
    const longSide = Math.max(original.width, original.height);
    const image =
      longSide > UPLOAD_IMAGE_MAX_SIDE
        ? await ImageManipulator.manipulate(original)
            .resize(
              original.width >= original.height
                ? { width: UPLOAD_IMAGE_MAX_SIDE }
                : { height: UPLOAD_IMAGE_MAX_SIDE },
            )
            .renderAsync()
        : original;
    const saved = await image.saveAsync({
      compress: UPLOAD_IMAGE_QUALITY,
      format: SaveFormat.JPEG,
    });
    return saved.uri;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[resizeImageForUpload] 사진 변환 실패, 원본으로 올립니다",
        error,
      );
    }
    return uri;
  }
}
