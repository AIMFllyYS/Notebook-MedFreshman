import { describe, expect, it } from 'vitest';
import {
  parseXmlTags,
  hasKnownCustomTags,
  stripUnclosedCustomTagTails,
  stripOrphanCustomTagMarkers,
} from '@/lib/utils/xmlParser';

describe('parseXmlTags', () => {
  it('归一化小写 formulasteps 为 FormulaSteps 组件块', () => {
    const blocks = parseXmlTags('<formulasteps>\n$a+b$\n$c+d$\n</formulasteps>');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('component');
    expect(blocks[0].tagName).toBe('FormulaSteps');
    expect(blocks[0].childrenText).toContain('$a+b$');
  });

  it('嵌套 Answer+FormulaSteps 时 Answer 保留内层 markup，二次 parse 得 FormulaSteps', () => {
    const blocks = parseXmlTags(
      '<Answer>先看结论\n<FormulaSteps>\n$E=mc^2$\n</FormulaSteps>\n</Answer>',
    );
    const answer = blocks.find((b) => b.type === 'component' && b.tagName === 'Answer');
    expect(answer).toBeDefined();
    expect(answer!.childrenText).toContain('FormulaSteps');
    const inner = parseXmlTags(answer!.childrenText || '');
    const formula = inner.find((b) => b.type === 'component' && b.tagName === 'FormulaSteps');
    expect(formula).toBeDefined();
    expect(formula!.childrenText).toContain('$E=mc^2$');
  });

  it('无内层 PascalCase 标签时 Answer 为单一组件块', () => {
    const blocks = parseXmlTags('<Answer>纯 markdown 正文</Answer>');
    expect(blocks).toHaveLength(1);
    expect(blocks[0].tagName).toBe('Answer');
    expect(blocks[0].childrenText).toBe('纯 markdown 正文');
  });
});

describe('stripUnclosedCustomTagTails', () => {
  it('剥离未闭合的 formulasteps 流式尾巴', () => {
    const input = '前文<formulasteps>\n步骤1\n';
    expect(stripUnclosedCustomTagTails(input)).toBe('前文');
  });

  it('保留已闭合的 FormulaSteps', () => {
    const input = '<FormulaSteps>\n$a$\n</FormulaSteps>';
    expect(stripUnclosedCustomTagTails(input)).toBe(input);
  });
});

describe('stripOrphanCustomTagMarkers', () => {
  it('清除拆分解耦后的 Answer orphan 片段', () => {
    expect(stripOrphanCustomTagMarkers('<Answer>intro')).toBe('intro');
    expect(stripOrphanCustomTagMarkers('outro</Answer>')).toBe('outro');
  });
});

describe('hasKnownCustomTags', () => {
  it('识别大小写变体', () => {
    expect(hasKnownCustomTags('plain text')).toBe(false);
    expect(hasKnownCustomTags('<formulasteps>')).toBe(true);
    expect(hasKnownCustomTags('<Answer>')).toBe(true);
  });
});
