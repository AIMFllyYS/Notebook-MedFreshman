import { tryGetBrowserAuthClient } from "./browserClient";
import { snapshotAuthSession, type AuthSession } from "./session";

export const ACCOUNT_URL = process.env.NEXT_PUBLIC_ACCOUNT_URL || "https://account.1037solo.com";
export function accountUrl(action: "login" | "register" | "forgot-password" | "update-password" | "security") {
  if(typeof window!=="undefined"){
    const host=window.location.hostname;
    if(host!=="1037solo.com"&&!host.endsWith(".1037solo.com")){
      const url=new URL('/api/account/oauth/start',window.location.origin);
      const next=(window.location.pathname==='/login'||window.location.pathname.startsWith('/auth/'))?'/':window.location.pathname+window.location.search;
      url.searchParams.set('next',next);url.searchParams.set('action',action);return url.toString();
    }
  }
  const url = new URL(`/${action}`, ACCOUNT_URL);
  if (typeof window !== "undefined") {
    const target = new URL(window.location.href);
    if (target.pathname === "/login") target.pathname = "/";
    target.hash = "";
    url.searchParams.set(action === "security" || action === "update-password" ? "next" : "redirect", target.toString());
  }
  return url.toString();
}

export function redirectAccount(action: Parameters<typeof accountUrl>[0] = "login") {
  if (typeof window !== "undefined") window.location.assign(accountUrl(action));
}
let pending: Promise<AuthSession | null> | null = null;
export function restoreAccountSession(): Promise<AuthSession | null> {
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch("/api/account/session", {method:"POST", credentials:"include", headers:{"Content-Type":"application/json"},body:"{}"});
    const client = tryGetBrowserAuthClient();
    if (response.status === 401) { await client?.auth.signOut({scope:"local"}); return null; }
    if(response.status===403){const error=await response.json().catch(()=>({}));if(error.code==="MFA_REQUIRED"){if(error.challenge_url==="/auth/challenge"){if(window.location.pathname!=="/auth/challenge")window.location.assign("/auth/challenge");return null;}redirectAccount("security");}throw new Error("请完成统一账号两步验证");}
    if (!response.ok) throw new Error("统一账号服务暂不可用");
    const session = await response.json();
    if (!client) throw new Error("统一账号配置缺失");
    const result = await client.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});
    if (result.error) throw result.error;
    if(window.location.pathname==="/auth/challenge"&&typeof session.returnTo==="string"&&session.returnTo.startsWith("/")&&!session.returnTo.startsWith("//"))window.location.assign(session.returnTo);
    return snapshotAuthSession(result.data.user, result.data.session);
  })().finally(()=>{pending=null;});
  return pending;
}
export async function logoutAccount() {
  const response=await fetch("/api/account/logout",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:"{}"});
  if(!response.ok)throw new Error("暂时无法退出，请重试");
  await tryGetBrowserAuthClient()?.auth.signOut({scope:"local"});
}
