export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordUser {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}

export interface PasswordAuthClient {
  auth: {
    getUser: () => Promise<{
      data: { user: PasswordUser | null };
      error: { message: string } | null;
    }>;
    updateUser: (attrs: {
      password?: string;
      data?: Record<string, unknown>;
    }) => Promise<{ error: { message: string } | null }>;
    signInWithPassword: (creds: {
      email: string;
      password: string;
    }) => Promise<{ error: { message: string } | null }>;
  };
}

export function hasPasswordSet(user: PasswordUser | null | undefined): boolean {
  return user?.user_metadata?.password_set === true;
}

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `密码至少 ${PASSWORD_MIN_LENGTH} 位`;
  }
  if (password !== confirm) return "两次输入的密码不一致";
  return null;
}

export async function readPasswordFlag(
  client: PasswordAuthClient,
): Promise<{ ok: true; hasPassword: boolean } | { ok: false; message: string }> {
  const { data, error } = await client.auth.getUser();
  if (error) return { ok: false, message: error.message || "无法读取账户" };
  return { ok: true, hasPassword: hasPasswordSet(data.user) };
}

export async function setAccountPassword(
  client: PasswordAuthClient,
  password: string,
  confirm: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { ok: false, message: invalid };
  const { error } = await client.auth.updateUser({
    password,
    data: { password_set: true },
  });
  if (error) return { ok: false, message: error.message || "设置密码失败" };
  return { ok: true };
}

export async function changeAccountPassword(
  client: PasswordAuthClient,
  email: string,
  oldPassword: string,
  password: string,
  confirm: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!oldPassword) return { ok: false, message: "请输入当前密码" };
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { ok: false, message: invalid };
  if (oldPassword === password) return { ok: false, message: "新密码不能与当前密码相同" };
  const signed = await client.auth.signInWithPassword({ email, password: oldPassword });
  if (signed.error) return { ok: false, message: "当前密码不正确" };
  const { error } = await client.auth.updateUser({
    password,
    data: { password_set: true },
  });
  if (error) return { ok: false, message: error.message || "修改密码失败" };
  return { ok: true };
}
