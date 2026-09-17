"use client";

import { useEffect, useState } from "react";
import { fetchQuota } from "@/lib/billing/fetchQuota";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { fetchAccountProfile } from "@/lib/profile/client";
import { membershipLabel, resolveNickname } from "@/lib/profile/displayName";
import { useUserProfile } from "@/lib/stores/userProfile";

export function useAccountProfile() {
  const { status, email, userId } = useAuthSession();
  const avatarSrc = useUserProfile((s) => (userId ? s.avatars[userId] ?? null : null));
  const cachedNickname = useUserProfile((s) => (userId ? s.nicknames[userId] ?? null : null));
  const cacheNickname = useUserProfile((s) => s.cacheNickname);
  const [membership, setMembership] = useState(status === "signedIn" ? "免费会员" : "未登录");

  const nickname = status === "signedIn" ? resolveNickname(cachedNickname, email) : "访客";

  useEffect(() => {
    if (!userId) {
      setMembership("未登录");
      return;
    }
    let cancelled = false;
    setMembership("免费会员");
    void fetchAccountProfile()
      .then((profile) => {
        if (cancelled || profile.userId !== userId) return;
        cacheNickname(userId, profile.nickname);
        setMembership(profile.membership);
      })
      .catch(() => {
        if (!cancelled) {
          void fetchQuota(userId)
            .then((quota) => {
              if (!cancelled) setMembership(membershipLabel(quota.tier));
            })
            .catch(() => {});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, cacheNickname]);

  return {
    status,
    email,
    userId,
    nickname,
    avatarSrc,
    membership,
    signedIn: status === "signedIn",
  };
}
