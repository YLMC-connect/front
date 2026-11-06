import { ImageManipulator } from "expo-image-manipulator";
import { resizeImageForUpload } from "../resizeImage";

jest.mock("expo-image-manipulator", () => ({
  ImageManipulator: { manipulate: jest.fn() },
  SaveFormat: { JPEG: "jpeg" },
}));

const manipulate = ImageManipulator.manipulate as jest.Mock;

function imageRef(width: number, height: number, uri: string) {
  return {
    width,
    height,
    saveAsync: jest.fn(async () => ({ uri, width, height })),
  };
}

type MockContext = {
  resize: jest.Mock<MockContext>;
  renderAsync: jest.Mock;
};

function context(rendered: ReturnType<typeof imageRef>) {
  const ctx: MockContext = {
    resize: jest.fn(() => ctx),
    renderAsync: jest.fn(async () => rendered),
  };
  return ctx;
}

describe("resizeImageForUpload", () => {
  beforeEach(() => {
    manipulate.mockReset();
  });

  it("shrinks a landscape photo so the long side is 1600px and saves JPEG 0.8", async () => {
    const original = imageRef(4032, 3024, "file:///original.jpg");
    const resized = imageRef(1600, 1200, "file:///resized.jpg");
    const resizeCtx = context(resized);
    manipulate
      .mockReturnValueOnce(context(original))
      .mockReturnValueOnce(resizeCtx);

    await expect(resizeImageForUpload("file:///photo.heic")).resolves.toBe(
      "file:///resized.jpg",
    );
    expect(manipulate).toHaveBeenNthCalledWith(2, original);
    expect(resizeCtx.resize).toHaveBeenCalledWith({ width: 1600 });
    expect(resized.saveAsync).toHaveBeenCalledWith({
      compress: 0.8,
      format: "jpeg",
    });
  });

  it("resizes a portrait photo by height", async () => {
    const original = imageRef(3024, 4032, "file:///original.jpg");
    const resizeCtx = context(imageRef(1200, 1600, "file:///resized.jpg"));
    manipulate
      .mockReturnValueOnce(context(original))
      .mockReturnValueOnce(resizeCtx);

    await resizeImageForUpload("file:///photo.jpg");
    expect(resizeCtx.resize).toHaveBeenCalledWith({ height: 1600 });
  });

  it("keeps the size of a small photo and only converts it to JPEG", async () => {
    const original = imageRef(1200, 800, "file:///converted.jpg");
    manipulate.mockReturnValueOnce(context(original));

    await expect(resizeImageForUpload("file:///small.png")).resolves.toBe(
      "file:///converted.jpg",
    );
    expect(manipulate).toHaveBeenCalledTimes(1);
    expect(original.saveAsync).toHaveBeenCalledWith({
      compress: 0.8,
      format: "jpeg",
    });
  });

  it("falls back to the original uri when conversion fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    manipulate.mockImplementationOnce(() => {
      throw new Error("decode failed");
    });

    await expect(resizeImageForUpload("file:///broken.jpg")).resolves.toBe(
      "file:///broken.jpg",
    );
    warn.mockRestore();
  });
});
