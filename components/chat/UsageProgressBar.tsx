import { contextRingColor, contextRingLevel } from '@/lib/context/estimateFullContext';

export interface UsageProgressBarProps {
  ratio: number;
  ariaLabel: string;
  /** 剩余量语义：占比越低，风险颜色越接近红色。 */
  invertRisk?: boolean;
  height?: number;
}

export function usageProgressColor(ratio: number, invertRisk = false): string {
  const boundedRatio = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  const riskRatio = invertRisk ? 1 - boundedRatio : boundedRatio;
  return contextRingColor(contextRingLevel(riskRatio));
}

export function UsageProgressBar({ ratio, ariaLabel, invertRisk = false, height = 6 }: UsageProgressBarProps) {
  const boundedRatio = Math.min(1, Math.max(0, Number.isFinite(ratio) ? ratio : 0));
  const riskRatio = invertRisk ? 1 - boundedRatio : boundedRatio;
  const level = contextRingLevel(riskRatio);
  const color = contextRingColor(level);

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(boundedRatio * 100)}
      data-risk-level={level}
      style={{
        height,
        borderRadius: height / 2,
        background: 'var(--bg-muted)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: `${boundedRatio * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          background: color,
          transition: 'width 0.3s ease, background 0.3s ease',
        }}
      />
    </div>
  );
}
