"use client";

import { useEffect, useState } from 'react';
import type { MoleculeCanvasBlock } from '@/lib/canvas/types';
import { loadRDKit } from '@/lib/chemistry/rdkit';
import { CanvasFrame } from '../CanvasFrame';
import { RawSvgRenderer } from './RawSvgRenderer';

interface MoleculeRendererProps {
  block: MoleculeCanvasBlock;
  onRevisionSubmit?: (instruction: string) => void | Promise<void>;
}

interface Resolved {
  key: string;
  svg?: string;
  error?: string;
}

export function MoleculeRenderer({ block, onRevisionSubmit }: MoleculeRendererProps) {
  const input = block.source.trim();
  const [resolved, setResolved] = useState<Resolved>({ key: '' });

  useEffect(() => {
    if (!input) return;
    let alive = true;
    loadRDKit()
      .then((RDKit) => {
        if (!alive) return;
        const mol = RDKit.get_mol(input);
        try {
          if (!mol || !mol.is_valid()) {
            setResolved({ key: input, error: 'Unable to parse molecule source.' });
            return;
          }
          setResolved({ key: input, svg: mol.get_svg(block.width ?? 380, block.height ?? 300) });
        } finally {
          mol?.delete();
        }
      })
      .catch(() => {
        if (alive) setResolved({ key: input, error: 'Molecule renderer failed to load RDKit.' });
      });
    return () => {
      alive = false;
    };
  }, [block.height, block.width, input]);

  if (!input) {
    return (
      <CanvasFrame
        title={block.title}
        source={block.source}
        diagnostic={{ ok: false, reason: 'empty-molecule', message: 'Molecule source is empty.' }}
        onRevisionSubmit={onRevisionSubmit}
      >
        <div />
      </CanvasFrame>
    );
  }

  if (resolved.key !== input) {
    return (
      <CanvasFrame title={block.title} source={block.source} onRevisionSubmit={onRevisionSubmit}>
        <div className="molecule-status">Rendering molecule structure...</div>
      </CanvasFrame>
    );
  }

  if (resolved.error || !resolved.svg) {
    return (
      <CanvasFrame
        title={block.title}
        source={block.source}
        diagnostic={{ ok: false, reason: 'molecule-render-error', message: resolved.error || 'Molecule rendering failed.' }}
        onRevisionSubmit={onRevisionSubmit}
      >
        <code className="molecule-smiles">{block.source}</code>
      </CanvasFrame>
    );
  }

  return (
    <RawSvgRenderer
      block={{ kind: 'raw-svg', title: block.title || 'Molecule structure', width: block.width, height: block.height, source: resolved.svg }}
      onRevisionSubmit={onRevisionSubmit}
    />
  );
}

export default MoleculeRenderer;
