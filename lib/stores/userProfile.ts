"use client";

import { createPersistedStore } from "./_persist";
import { isLocalAvatarUrl } from "@/lib/profile/localAvatar";

export const USER_PROFILE_STORAGE_KEY = "studysolo-user-profile";

interface UserProfileState {
  avatars: Record<string, string>;
  nicknames: Record<string, string>;
  setLocalAvatar: (userId: string, dataUrl: string | null) => void;
  cacheNickname: (userId: string, nickname: string | null) => void;
}

export const useUserProfile = createPersistedStore<UserProfileState>(
  (set) => ({
    avatars: {},
    nicknames: {},
    setLocalAvatar: (userId, dataUrl) => {
      if (!userId) return;
      set((state) => {
        const avatars = { ...state.avatars };
        if (dataUrl && isLocalAvatarUrl(dataUrl)) avatars[userId] = dataUrl;
        else delete avatars[userId];
        return { avatars };
      });
    },
    cacheNickname: (userId, nickname) => {
      if (!userId) return;
      set((state) => {
        const nicknames = { ...state.nicknames };
        const cleaned = nickname?.trim() ?? "";
        if (cleaned) nicknames[userId] = cleaned;
        else delete nicknames[userId];
        return { nicknames };
      });
    },
  }),
  {
    name: USER_PROFILE_STORAGE_KEY,
    storage: "local",
    version: 1,
    partialize: (state) => ({
      avatars: state.avatars,
      nicknames: state.nicknames,
    }),
  },
);
