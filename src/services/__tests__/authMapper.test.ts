import {
  mapAuthSession,
  mapMemberAvailability,
  mapMemberFromMe,
} from "../authMapper";

describe("authMapper", () => {
  it("maps an observed login token payload to a session", () => {
    expect(
      mapAuthSession({
        accessToken: "access",
        refreshToken: "refresh",
        userId: "ylmc",
        userName: "열린문",
        role: "USER",
      }),
    ).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      member: { id: "ylmc", name: "열린문", role: "member" },
    });
  });

  it("maps an observed me payload to a member", () => {
    expect(
      mapMemberFromMe({
        id: "ylmc",
        userName: "열린문",
        mokjangName: "1목장",
        role: "USER",
      }),
    ).toEqual({
      id: "ylmc",
      name: "열린문",
      department: "1목장",
      role: "member",
    });
  });

  it("maps duplicate availability without extra fields", () => {
    expect(mapMemberAvailability({ available: false })).toEqual({
      available: false,
    });
  });

  it("rejects an incomplete token payload", () => {
    expect(() => mapAuthSession({ accessToken: "access" })).toThrow(
      expect.objectContaining({ code: "INVALID_RESPONSE" }),
    );
  });

  it("rejects a duplicate payload without available", () => {
    expect(() => mapMemberAvailability({ ok: true })).toThrow(
      expect.objectContaining({ code: "INVALID_RESPONSE" }),
    );
  });
});
