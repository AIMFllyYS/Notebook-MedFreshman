import { describe, expect, it } from 'vitest';
import {
  parseXmlTags,
  hasKnownCustomTags,
  stripUnclosedCustomTagTails,
  stripOrphanCustomTagMarkers,
} from '@/lib/utils/xmlParser';

describe('parseXmlTags', () => {
  it('保留普通小写 HTML 为单个 markdown 块，不拆碎 details/summary', () => {
    const html = '<details><summary>答案</summary>这里是答案</details>';
    const blocks = parseXmlTags(html);

    expect(blocks).toEqual([{ type: 'markdown', content: html }]);
    expect(blocks.some((block) => block.content === '<')).toBe(false);
    expect(blocks.some((block) => block.content === 'details>')).toBe(false);
  });

  it('SvgDiagram raw children 中的自闭合 SVG 子元素不抢占外层组件闭合', () => {
    const blocks = parseXmlTags(
      '<SvgDiagram mode="raw"><svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" /></svg></SvgDiagram>',
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('component');
    expect(blocks[0].tagName).toBe('SvgDiagram');
    expect(blocks[0].props?.mode).toBe('raw');
    expect(blocks[0].childrenText).toContain('<line x1="0" y1="0" x2="10" y2="10" />');
    expect(blocks[0].childrenText).toContain('</svg>');
  });

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

  it('剥离未闭合的 SvgDiagram 和 FollowUp 流式尾巴', () => {
    expect(stripUnclosedCustomTagTails('前文<SvgDiagram mode="raw"><svg><line')).toBe('前文');
    expect(stripUnclosedCustomTagTails('前文<FollowUp>下一问')).toBe('前文');
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
