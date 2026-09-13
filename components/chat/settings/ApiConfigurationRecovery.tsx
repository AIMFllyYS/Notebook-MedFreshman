'use client';

import { useRef, useState } from 'react';
import { useSettings } from '@/lib/hooks/useSettings';
import { backupSettings, decodeApiBackup, encodeApiBackup, readSettingsBackup } from '@/lib/stores/settingsRecovery';
import { splitSettingsSecrets } from '@/lib/stores/apiSecrets';

export function ApiConfigurationRecovery() {
  const groups = useSettings((s) => s.customApiGroups);
  const warning = useSettings((s) => s.settingsLoadWarning);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const importText = (raw: string) => {
    const data = decodeApiBackup(raw);
    useSettings.getState().importApiConfiguration(data.groups, data.selectedModelId);
    setMessage(`已合并恢复 ${data.groups.length} 个分组，已有配置不会被旧备份覆盖。`);
  };
  const button = 'rounded-md border border-[var(--line)] px-2 py-1.5 text-[11px] text-[var(--ink-soft)] hover:bg-[var(--bg-muted)]';
  return <div className="space-y-2">
    {warning ? <p role="alert" className="text-[11px] text-[var(--md-sys-color-error)]">{warning}</p> : null}
    {!groups.length ? <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">当前地址没有读到自定义分组。浏览器按地址和端口独立保存设置；若从旧地址升级，请先在那里导出配置，再到这里导入。不要清空浏览器数据。</p> : null}
    <div className="flex flex-wrap gap-2">
      <button type="button" className={button} onClick={() => fileRef.current?.click()}>导入 API 配置</button>
      <button type="button" disabled={!groups.length} className={button + ' disabled:opacity-40'} onClick={() => {
        backupSettings(localStorage);
        const data = encodeApiBackup(groups, useSettings.getState().selectedModelId);
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'studyreview-api-backup.json'; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('备份含可恢复的 API 密钥，仅供本人保管，请勿分享。');
      }}>导出 API 配置</button>
      <button type="button" className={button} onClick={() => {
        const backup = readSettingsBackup(localStorage);
        if (!backup) { setMessage('当前地址没有可用的迁移前备份。请回旧地址导出配置；此操作不会修改现有数据。'); return; }
        try {
          const data = decodeApiBackup(backup.settings);
          const split = splitSettingsSecrets(data.groups, backup.secrets);
          useSettings.getState().importApiConfiguration(split.groupsForMemory, data.selectedModelId);
          setMessage('已合并恢复本机备份。');
        } catch { setMessage('备份无法读取，原记录未修改。'); }
      }}>恢复本机备份</button>
    </div>
    <p className="text-[10px] leading-relaxed text-[var(--ink-faint)]">导出包含可恢复的密钥（轻量混淆，不是加密），请勿上传或分享备份文件。</p>
    <input ref={fileRef} type="file" accept="application/json,.json" aria-label="导入 API 配置文件" className="hidden" onChange={async (event) => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
      try { if (file.size > 2_000_000) throw new Error('文件过大'); importText(await file.text()); }
      catch (error) { setMessage(error instanceof Error ? error.message : '无法导入配置，原设置未修改。'); }
    }} />
    {message ? <p role="status" className="text-[11px] text-[var(--ink-soft)]">{message}</p> : null}
  </div>;
}
