'use client'

import type { ReactNode } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { getClassUserId } from '@/classolo/lib/db'

import { cn } from '@/classolo/lib/utils'


export function WorkbenchPane({
  title,
  children,
  className,
}: {
  title: string
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'node-paper-bg flex h-full min-h-0 flex-col text-foreground',
        className,
      )}
    >
      <header className="border-b border-dashed border-border/50 px-3 py-2 font-serif text-[11px] font-medium tracking-[0.2em] text-muted-foreground/80 uppercase">
        {title}
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>
    </section>
  )
}

export interface WorkbenchPaneSlots {
  transcript?: ReactNode
  notes?: ReactNode
  transcriptRender?: ReactNode
  notesRender?: ReactNode
}

/** SSR-safe 1:1 default split. No Group/Panel — those hydrate with localStorage sizes. */
export function WorkbenchStaticPanes({
  transcript,
  notes,
  transcriptRender,
  notesRender,
}: WorkbenchPaneSlots) {
  return (
    <div
      className="flex h-full min-h-0 w-full"
      data-slot="workbench-static-panes"
    >
      <div className="flex min-h-0 min-w-0 flex-[50] flex-col">
        <div className="min-h-0 min-w-0 flex-[65]">
          <WorkbenchPane title="文稿区">{transcript}</WorkbenchPane>
        </div>
        <div className="h-1 shrink-0 bg-border" />
        <div className="min-h-0 min-w-0 flex-[35]">
          <WorkbenchPane title="文稿渲染区">{transcriptRender}</WorkbenchPane>
        </div>
      </div>
      <div className="w-1 shrink-0 bg-border" />
      <div className="flex min-h-0 min-w-0 flex-[50] flex-col">
        <div className="min-h-0 min-w-0 flex-[65]">
          <WorkbenchPane title="笔记区">{notes}</WorkbenchPane>
        </div>
        <div className="h-1 shrink-0 bg-border" />
        <div className="min-h-0 min-w-0 flex-[35]">
          <WorkbenchPane title="笔记渲染区">{notesRender}</WorkbenchPane>
        </div>
      </div>
    </div>
  )
}

/** Mount only after hydration. useDefaultLayout reads localStorage during render. */
export function WorkbenchResizablePanes(slots:WorkbenchPaneSlots){
  const scope=`ss-class-layout:${getClassUserId()}`;
  return <PanelGroup direction="horizontal" autoSaveId={`${scope}:columns`} className="h-full w-full">
    <Panel defaultSize={50} minSize={25}><PanelGroup direction="vertical" autoSaveId={`${scope}:transcript`}>
      <Panel defaultSize={65} minSize={25}><WorkbenchPane title="课堂文稿">{slots.transcript}</WorkbenchPane></Panel>
      <PanelResizeHandle className="h-1 bg-border"/>
      <Panel minSize={15}><WorkbenchPane title="文稿补充">{slots.transcriptRender}</WorkbenchPane></Panel>
    </PanelGroup></Panel>
    <PanelResizeHandle className="w-1 bg-border"/>
    <Panel minSize={25}><PanelGroup direction="vertical" autoSaveId={`${scope}:notes`}>
      <Panel defaultSize={65} minSize={25}><WorkbenchPane title="思维导图">{slots.notes}</WorkbenchPane></Panel>
      <PanelResizeHandle className="h-1 bg-border"/>
      <Panel minSize={15}><WorkbenchPane title="课堂解析">{slots.notesRender}</WorkbenchPane></Panel>
    </PanelGroup></Panel>
  </PanelGroup>;
}
