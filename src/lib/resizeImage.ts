import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Image } from "react-native";

export const UPLOAD_IMAGE_MAX_SIDE = 1600;
export const UPLOAD_IMAGE_QUALITY = 0.8;
/** 등록 시 아직 끝나지 않은 변환을 이만큼만 기다리고, 넘으면 원본으로 올린다. */
export const UPLOAD_IMAGE_TIMEOUT_MS = 20_000;

function getImageSize(uri: string) {
  return Image.getSize(uri);
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`사진 변환이 ${ms}ms 안에 끝나지 않았습니다`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function resize(uri: string) {
  const { width, height } = await getImageSize(uri);
  const actions =
    Math.max(width, height) > UPLOAD_IMAGE_MAX_SIDE
      ? [
          {
            resize:
              width >= height
                ? { width: UPLOAD_IMAGE_MAX_SIDE }
                : { height: UPLOAD_IMAGE_MAX_SIDE },
          },
        ]
      : [];
  // 새 ImageManipulator.manipulate().renderAsync() 는 iOS 개발 빌드에서 응답이 매우 늦어
  // (나눔 등록 무한 로딩) manipulateAsync 를 쓴다.
  const result = await manipulateAsync(uri, actions, {
    compress: UPLOAD_IMAGE_QUALITY,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

function isLocalFile(uri: string) {
  return !/^https?:\/\//.test(uri);
}

/** 원본 uri → 변환 결과(실패하면 원본). 사진을 고르자마자 시작해 둔다. */
const pending = new Map<string, Promise<string>>();

/**
 * 사진을 고른 직후 부른다. 업로드용 변환을 미리 시작해, 등록 버튼을 누를 때
 * 기다리지 않게 한다. 이미 시작했거나 서버 사진(http)이면 아무것도 안 한다.
 */
export function prepareImageForUpload(uri: string) {
  if (!isLocalFile(uri) || pending.has(uri)) return;
  pending.set(
    uri,
    resize(uri).catch((error) => {
      if (__DEV__) {
        console.warn(
          "[resizeImageForUpload] 사진 변환 실패, 원본으로 올립니다",
          String(error),
        );
      }
      return uri;
    }),
  );
}

/**
 * 업로드용 사진 uri 를 돌려준다. 긴 변이 1600px 보다 크면 1600px 로 줄이고,
 * 작으면 크기는 그대로 둔 채 JPEG(품질 0.8)로만 다시 저장한다.
 * 미리 시작한 변환이 있으면 그 결과를 쓰고, 실패하거나 20초 안에 끝나지 않으면 원본 uri.
 */
export async function resizeImageForUpload(uri: string): Promise<string> {
  prepareImageForUpload(uri);
  const job = pending.get(uri);
  if (!job) return uri;
  try {
    return await withTimeout(job, UPLOAD_IMAGE_TIMEOUT_MS);
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[resizeImageForUpload] 사진 변환이 늦어 원본으로 올립니다",
        String(error),
      );
    }
    return uri;
  } finally {
    pending.delete(uri);
  }
}
