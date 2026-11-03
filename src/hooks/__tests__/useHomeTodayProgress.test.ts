import AsyncStorage from "@react-native-async-storage/async-storage";
import { cleanupOldProgressKeys } from "../useHomeTodayProgress";

describe("cleanupOldProgressKeys", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("removes progress keys older than maxDays while keeping recent ones", async () => {
    const today = new Date("2026-11-04T00:00:00.000Z");
    const sixDaysAgo = "ylmc.home.progress.2026-10-29";
    const tenDaysAgo = "ylmc.home.progress.2026-10-25";
    const irrelevantKey = "other.app.key";

    await AsyncStorage.setItem(sixDaysAgo, JSON.stringify(["dawn-word"]));
    await AsyncStorage.setItem(tenDaysAgo, JSON.stringify(["daily-prayer"]));
    await AsyncStorage.setItem(irrelevantKey, "value");

    await cleanupOldProgressKeys(today, 7);

    const remainingKeys = await AsyncStorage.getAllKeys();
    expect(remainingKeys).toContain(sixDaysAgo);
    expect(remainingKeys).toContain(irrelevantKey);
    expect(remainingKeys).not.toContain(tenDaysAgo);
  });
});
