import { beforeEach, describe, expect, it } from "vitest";
import { useUserProfile, USER_PROFILE_STORAGE_KEY } from "./userProfile";

describe("userProfile store", () => {
  beforeEach(() => {
    localStorage.clear();
    useUserProfile.setState({ avatars: {}, nicknames: {} });
  });

  it("persists avatar locally and never treats a remote URL as stored", () => {
    useUserProfile.getState().setLocalAvatar("u1", "https://cdn.example/a.png");
    expect(useUserProfile.getState().avatars.u1).toBeUndefined();
    useUserProfile.getState().setLocalAvatar("u1", "data:image/png;base64,aaa");
    expect(useUserProfile.getState().avatars.u1).toBe("data:image/png;base64,aaa");
    expect(localStorage.getItem(USER_PROFILE_STORAGE_KEY)).toContain("data:image/png");
    useUserProfile.getState().setLocalAvatar("u1", null);
    expect(useUserProfile.getState().avatars.u1).toBeUndefined();
  });

  it("caches nicknames per user", () => {
    useUserProfile.getState().cacheNickname("u1", "  苏  ");
    expect(useUserProfile.getState().nicknames.u1).toBe("苏");
    useUserProfile.getState().cacheNickname("u1", "");
    expect(useUserProfile.getState().nicknames.u1).toBeUndefined();
  });
});
