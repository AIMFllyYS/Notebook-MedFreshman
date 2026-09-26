'use client'

import { useEffect, useMemo } from 'react'

import { ClassroomMindmap } from '@/classolo/components/mindmap'
import { useNotesPublic } from '@/classolo/lib/session'

import { publishOutlineJump } from './jump'
import { startOutlineOrganizer } from './organizer'

export function NotesPane() {
  useEffect(() => startOutlineOrganizer(), [])
  const version = useNotesPublic((state) => state.outlineVersion)
  const digest = useNotesPublic((state) => state.outlineDigest)
  const tree = useMemo(
    () => digest.map((node) => ({ id: node.id, title: node.title })),
    [digest],
  )

  return (
    <div className="flex h-full min-h-64 flex-col gap-2 text-sm">
      <p className="text-muted-foreground">大纲版本：{version}</p>
      {tree.length === 0 ? (
        <p className="text-muted-foreground">尚无大纲节点。</p>
      ) : (
        <div className="min-h-64 flex-1 overflow-hidden rounded-lg border border-border">
          <ClassroomMindmap nodes={tree} onNodeClick={publishOutlineJump} />
        </div>
      )}
    </div>
  )
}
