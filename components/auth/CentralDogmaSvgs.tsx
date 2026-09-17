"use client";

export function ReplicationSvg() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" aria-hidden>
      <path d="M18 10c10 8 10 36 0 44" fill="none" stroke="#8ab4ff" strokeWidth="3" />
      <path d="M30 10c-10 8-10 36 0 44" fill="none" stroke="#6ee7b7" strokeWidth="3" />
      <path d="M58 10c10 8 10 36 0 44" fill="none" stroke="#8ab4ff" strokeWidth="3" />
      <path d="M70 10c-10 8-10 36 0 44" fill="none" stroke="#f4c45a" strokeWidth="3" />
      <path d="M24 32 H64" stroke="#cdd6e4" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="48" cy="32" r="4" fill="#ff8a6b" />
    </svg>
  );
}

export function TranscriptionSvg() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" aria-hidden>
      <path d="M12 18 H84" stroke="#8ab4ff" strokeWidth="4" />
      <path d="M12 26 H84" stroke="#5d7fcf" strokeWidth="4" />
      <path d="M40 26 C52 26 56 40 70 46 C78 50 84 52 88 50" fill="none" stroke="#f4c45a" strokeWidth="3.2" />
      <circle cx="40" cy="22" r="5" fill="#6ee7b7" />
    </svg>
  );
}

export function ProcessingSvg() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" aria-hidden>
      <path d="M10 32 C22 12 34 52 46 32 C58 12 70 52 86 32" fill="none" stroke="#f0a6d0" strokeWidth="3" />
      <path d="M28 20 l8-8 8 8" fill="none" stroke="#ff8a6b" strokeWidth="2.4" />
      <path d="M60 44 l8 8 8-8" fill="none" stroke="#6ee7b7" strokeWidth="2.4" />
      <circle cx="46" cy="32" r="3.2" fill="#8ab4ff" />
    </svg>
  );
}

export function TranslationSvg() {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" aria-hidden>
      <path d="M8 44 H88" stroke="#8ab4ff" strokeWidth="3" />
      <rect x="34" y="16" width="28" height="22" rx="7" fill="none" stroke="#f4c45a" strokeWidth="3" />
      <circle cx="28" cy="44" r="3" fill="#6ee7b7" />
      <circle cx="40" cy="44" r="3" fill="#6ee7b7" />
      <circle cx="52" cy="44" r="3" fill="#6ee7b7" />
      <path d="M62 20 h18" stroke="#ff8a6b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="84" cy="20" r="4" fill="#ff8a6b" />
    </svg>
  );
}

export const MEDICINE_SVGS: Record<string, typeof ReplicationSvg> = {
  replication: ReplicationSvg,
  transcription: TranscriptionSvg,
  processing: ProcessingSvg,
  translation: TranslationSvg,
};
