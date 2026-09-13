import { createClient } from '@supabase/supabase-js';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthProvider, useAuthSession } from '@/lib/hooks/useAuthSession';
import { AccountQuota } from '@/components/chat/AccountQuota';
import { decideAiGate } from '@/lib/auth/aiGate';

vi.mock('@/lib/sync/schedule', () => ({ scheduleCloudPull: vi.fn(), setCloudSyncEnabled: vi.fn() }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function AgentProbe() {
  const auth = useAuthSession();
  return <>
    <span data-testid="auth-status">{auth.status}</span>
    <button onClick={() => void auth.verifyOtp('bridge@example.com', '123456')}>验证登录</button>
    <button onClick={() => void fetch('/api/chat', { method: 'POST', body: '{}' })}>检查 Agent 请求</button>
    <AccountQuota />
  </>;
}

it('real Supabase SDK login reaches both quota and the Agent gate through AuthProvider', async () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '');
  const token = `${encode({ alg: 'HS256' })}.${encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  const calls: string[] = [];
  let gate: Awaited<ReturnType<typeof decideAiGate>> | undefined;
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/auth/v1/verify')) return Response.json({
      access_token: token, refresh_token: 'test-only-refresh', token_type: 'bearer', expires_in: 3600,
      user: { id: userId, email: 'bridge@example.com', aud: 'authenticated', role: 'authenticated', created_at: new Date().toISOString(), app_metadata: {}, user_metadata: {} },
    });
    if (url === '/api/quota' || url === '/api/chat') {
      const headers = new Headers(init?.headers);
      expect(headers.get('authorization')).toBe(`Bearer ${token}`);
      calls.push(url);
      if (url === '/api/chat') {
        gate = await decideAiGate({ pathname: url, method: 'POST', headers }, { verifyAccessToken: async (received) => received === token ? { id: userId } : null });
        return Response.json({ ok: gate.action === 'next' });
      }
      return Response.json({ userId, tier: 'plus', periodStart: '2026-09-01T00:00:00Z', periodEnd: '2026-10-01T00:00:00Z', updatedAt: new Date().toISOString(), platform: { cap: 70, used: 2, remaining: 68 }, byok: { cap: 70, used: 1, remaining: 69 } });
    }
    throw new Error(`Unexpected test URL: ${url}`);
  }));
  const client = createClient('https://bridge.invalid', 'test-public-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  render(<AuthProvider client={client}><AgentProbe /></AuthProvider>);
  await waitFor(() => expect(screen.getByTestId('auth-status').textContent).toBe('signedOut'));
  await act(async () => fireEvent.click(screen.getByText('验证登录')));
  await screen.findByText('Plus 会员');
  expect(screen.queryByText('登录后查看会员与额度')).toBeNull();
  await act(async () => fireEvent.click(screen.getByText('检查 Agent 请求')));
  expect(gate).toEqual({ action: 'next' });
  expect(calls).toContain('/api/quota');
  expect(calls).toContain('/api/chat');
});
