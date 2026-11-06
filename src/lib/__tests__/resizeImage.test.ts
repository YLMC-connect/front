import { manipulateAsync } from "expo-image-manipulator";
import { Image } from "react-native";
import {
  prepareImageForUpload,
  resizeImageForUpload,
  UPLOAD_IMAGE_TIMEOUT_MS,
} from "../resizeImage";

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg" },
}));

const manipulate = manipulateAsync as jest.Mock;

function mockSize(width: number, height: number) {
  // getSize 는 콜백·Promise 오버로드라 spy 타입을 Mock 으로 좁힌다
  (jest.spyOn(Image, "getSize") as jest.Mock).mockResolvedValue({
    width,
    height,
  });
}

describe("resizeImageForUpload", () => {
  beforeEach(() => {
    manipulate.mockReset();
    jest.restoreAllMocks();
  });

  it("shrinks a landscape photo so the long side is 1600px and saves JPEG 0.8", async () => {
    mockSize(4032, 3024);
    manipulate.mockResolvedValue({ uri: "file:///resized.jpg" });

    await expect(resizeImageForUpload("file:///a.jpg")).resolves.toBe(
      "file:///resized.jpg",
    );
    expect(manipulate).toHaveBeenCalledWith(
      "file:///a.jpg",
      [{ resize: { width: 1600 } }],
      { compress: 0.8, format: "jpeg" },
    );
  });

  it("resizes a portrait photo by height", async () => {
    mockSize(3024, 4032);
    manipulate.mockResolvedValue({ uri: "file:///resized.jpg" });

    await resizeImageForUpload("file:///b.jpg");
    expect(manipulate).toHaveBeenCalledWith(
      "file:///b.jpg",
      [{ resize: { height: 1600 } }],
      { compress: 0.8, format: "jpeg" },
    );
  });

  it("keeps the size of a small photo and only re-saves it as JPEG", async () => {
    mockSize(1200, 900);
    manipulate.mockResolvedValue({ uri: "file:///jpeg.jpg" });

    await expect(resizeImageForUpload("file:///c.png")).resolves.toBe(
      "file:///jpeg.jpg",
    );
    expect(manipulate).toHaveBeenCalledWith("file:///c.png", [], {
      compress: 0.8,
      format: "jpeg",
    });
  });

  it("falls back to the original uri when conversion fails", async () => {
    mockSize(4000, 3000);
    manipulate.mockRejectedValue(new Error("decode failed"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(resizeImageForUpload("file:///d.jpg")).resolves.toBe(
      "file:///d.jpg",
    );
    warn.mockRestore();
  });

  it("reuses the conversion started when the photo was picked", async () => {
    mockSize(4000, 3000);
    manipulate.mockResolvedValue({ uri: "file:///pre.jpg" });

    prepareImageForUpload("file:///e.jpg");
    prepareImageForUpload("file:///e.jpg");
    await expect(resizeImageForUpload("file:///e.jpg")).resolves.toBe(
      "file:///pre.jpg",
    );
    expect(manipulate).toHaveBeenCalledTimes(1);
  });

  it("leaves server photos (http) untouched", async () => {
    await expect(
      resizeImageForUpload("https://example.com/photo.jpg"),
    ).resolves.toBe("https://example.com/photo.jpg");
    expect(manipulate).not.toHaveBeenCalled();
  });

  it("uploads the original when conversion does not finish in time", async () => {
    jest.useFakeTimers();
    mockSize(4000, 3000);
    manipulate.mockReturnValue(new Promise(() => {}));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = resizeImageForUpload("file:///slow.jpg");
    await jest.advanceTimersByTimeAsync(UPLOAD_IMAGE_TIMEOUT_MS);
    await expect(result).resolves.toBe("file:///slow.jpg");

    warn.mockRestore();
    jest.useRealTimers();
  });
});
