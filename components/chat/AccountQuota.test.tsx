import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AccountQuota } from './AccountQuota';
import { fetchQuota } from '@/lib/billing/fetchQuota';

let userId: string | null = 'one';
vi.mock('@/lib/hooks/useAuthSession', () => ({ useAuthSession: () => ({ userId, status: userId ? 'signedIn' : 'signedOut' }) }));
vi.mock('@/lib/billing/fetchQuota', () => ({ fetchQuota: vi.fn() }));
const value = (id: string) => ({ userId: id, tier: 'plus' as const, periodStart: '2026-09-01T00:00:00Z', periodEnd: '2026-10-01T00:00:00Z', updatedAt: '2026-09-13T00:00:00Z', platform: { cap: 70, used: 2, remaining: 68 }, byok: { cap: 70, used: 1, remaining: 69 } });
afterEach(() => { cleanup(); vi.resetAllMocks(); userId = 'one'; });
it('shows both pools and never labels the period as membership expiry', async () => {
  vi.mocked(fetchQuota).mockResolvedValue(value('one'));
  render(<AccountQuota />);
  await screen.findByText('Plus 会员');
  expect(screen.getByText('平台模型额度')).toBeTruthy();
  expect(screen.getByText('自备 API 辅助额度')).toBeTruthy();
  expect(screen.queryByText(/会员到期/)).toBeNull();
});
it('discards a late old-account response and never turns errors into zero balance', async () => {
  let resolveOld!: (data: ReturnType<typeof value>) => void;
  vi.mocked(fetchQuota).mockImplementation((id) => id === 'one' ? new Promise((resolve) => { resolveOld = resolve; }) : Promise.reject(new Error('暂不可用')));
  const view = render(<AccountQuota />);
  userId = 'two'; view.rerender(<AccountQuota />);
  await waitFor(() => expect(screen.getByText('暂不可用')).toBeTruthy());
  await act(async () => resolveOld(value('one')));
  expect(screen.queryByText('Plus 会员')).toBeNull();
  expect(screen.queryByText(/¥0/)).toBeNull();
  userId = null; view.rerender(<AccountQuota />);
  expect(screen.getByText('登录后查看会员与额度')).toBeTruthy();
});
