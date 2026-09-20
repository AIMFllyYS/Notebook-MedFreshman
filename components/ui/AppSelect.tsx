"use client";

import { Check, ChevronDown } from "lucide-react";
import AnchoredMenu from "./AnchoredMenu";
import { useT } from "@/lib/i18n";

interface AppSelectProps<T extends string> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string; disabled?: boolean }[];
  disabled?: boolean;
  className?: string;
}

export default function AppSelect<T extends string>({ label, value, onValueChange, options, disabled, className = "" }: AppSelectProps<T>) {
  const t = useT();
  const selected = options.find((option) => option.value === value);
  return <AnchoredMenu label={label} role="listbox" disabled={disabled} width={280}
    className={`app-select ${className}`} trigger={<><span>{selected?.label ?? (value || t("menu.common.select"))}</span><ChevronDown size={13} /></>}>
    {(close) => options.map((option) => <button key={option.value} type="button" role="option"
      aria-selected={option.value === value} disabled={option.disabled} className="app-menu-item"
      onClick={() => { onValueChange(option.value); close(); }}>
      <span className="app-menu-check">{option.value === value && <Check size={13} />}</span>
      <span>{option.label}</span>
    </button>)}
  </AnchoredMenu>;
}
