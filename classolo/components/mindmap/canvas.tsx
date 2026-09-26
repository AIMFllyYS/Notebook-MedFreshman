'use client'

import { useMemo, useState } from 'react'
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { cn } from '@/classolo/lib/utils'

import { ClassroomOutlineNode } from './classroom-outline-node'
import { diffOutlineLayout, type OutlineTreeNode } from './layout'

const nodeTypes = {
  classroomOutline: ClassroomOutlineNode,
} satisfies NodeTypes

export interface ClassroomMindmapProps {
  nodes: readonly OutlineTreeNode[]
  className?: string
  onNodeClick?: (id: string) => void
}

function treeSignature(nodes: readonly OutlineTreeNode[]): string {
  return nodes
    .map((node) => `${node.id}\0${node.title}\0${node.parentId ?? ''}`)
    .join('\n')
}

function MindmapFlow({ nodes, className, onNodeClick }: ClassroomMindmapProps) {
  const signature = treeSignature(nodes)
  const [seenSignature, setSeenSignature] = useState(signature)
  const [diffed, setDiffed] = useState(() => diffOutlineLayout([], nodes))
  if (signature !== seenSignature) {
    setSeenSignature(signature)
    setDiffed(diffOutlineLayout(diffed.graph.nodes, nodes))
  }

  const flowNodes: Node[] = useMemo(() => {
    const entered = new Set(diffed.enteredIds)
    return diffed.graph.nodes.map((node) => ({
      id: node.id,
      type: 'classroomOutline',
      position: node.position,
      data: { title: node.title, entering: entered.has(node.id) },
      draggable: false,
    }))
  }, [diffed])
  const flowEdges: Edge[] = useMemo(
    () =>
      diffed.graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    [diffed],
  )

  return (
    <div className={cn('h-full min-h-64 w-full', className)}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        fitView
        minZoom={0.25}
        maxZoom={2}
        colorMode="system"
        defaultEdgeOptions={{ type: 'smoothstep' }}
        onNodeClick={(_event, node) => {
          onNodeClick?.(node.id)
        }}
      >
        <Background gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export function ClassroomMindmap(props: ClassroomMindmapProps) {
  return (
    <ReactFlowProvider>
      <MindmapFlow {...props} />
    </ReactFlowProvider>
  )
}
