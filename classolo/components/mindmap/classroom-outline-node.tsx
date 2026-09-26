'use client'

import { motion } from 'framer-motion'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

import { cn } from '@/classolo/lib/utils'

export type ClassroomOutlineNodeData = {
  title: string
  entering?: boolean
}

export type ClassroomOutlineFlowNode = Node<
  ClassroomOutlineNodeData,
  'classroomOutline'
>

export function ClassroomOutlineNode({
  data,
  selected,
}: NodeProps<ClassroomOutlineFlowNode>) {
  return (
    <motion.div
      className={cn(
        'min-w-40 max-w-56 rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm',
        selected && 'ring-2 ring-ring',
      )}
      initial={data.entering ? { opacity: 0, scale: 0.85 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-border !bg-primary"
      />
      <p className="font-medium leading-snug">{data.title}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-border !bg-primary"
      />
    </motion.div>
  )
}
