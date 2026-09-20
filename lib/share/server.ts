import { createServiceAuthClient } from "@/lib/auth/serviceClient";
import type { SharedConversationSnapshot } from "./types.ts";

/** 表名常量：route、测试与将来的撤回接口共用一处，避免三处写错同一个名字。 */
export const SHARED_CONVERSATIONS_TABLE = "shared_conversations";

export interface SharedConversationInsert {
  id: string;
  /** 服务端从已鉴权用户取；客户端传什么都不作数。 */
  ownerId: string;
  sourceClientId: string;
  title: string;
  payload: SharedConversationSnapshot;
}

export interface ShareStore {
  create(row: SharedConversationInsert): Promise<void>;
}

/** 测试注入口（同 lib/profile/server.ts 的 setProfileApiTestDeps 思路）。 */
interface ShareApiTestDeps {
  store?: ShareStore;
}

let testDeps: ShareApiTestDeps | null = null;

export function setShareApiTestDeps(deps: ShareApiTestDeps | null): void {
  testDeps = deps;
}

function defaultStore(): ShareStore {
  return {
    async create(row) {
      // service_role 绕过 RLS：owner_id 只能由这里写死，请求体里的 owner 字段在 route 就被丢了。
      const client = createServiceAuthClient();
      const { error } = await client.from(SHARED_CONVERSATIONS_TABLE).insert({
        id: row.id,
        owner_id: row.ownerId,
        source_client_id: row.sourceClientId,
        title: row.title,
        payload: row.payload,
      });
      if (error) throw new Error(error.message);
    },
  };
}

export async function saveSharedConversation(row: SharedConversationInsert): Promise<void> {
  await (testDeps?.store ?? defaultStore()).create(row);
}
