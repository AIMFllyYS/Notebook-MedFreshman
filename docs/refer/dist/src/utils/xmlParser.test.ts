import { describe, it, expect } from 'vitest';
import { parseXmlTags } from './xmlParser';

describe('xmlParser', () => {
  it('should parse pure markdown correctly', () => {
    const markdown = '# Hello World\nThis is a test *markdown*.';
    const result = parseXmlTags(markdown);
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('markdown');
    expect(result[0].content).toBe(markdown);
  });

  it('should parse simple self-closing tags with primitive props', () => {
    const input = 'Here is a chart: <InteractiveVenn a={0.5} b={0.4} ab={0.2} isVisible={true} title="Test" />';
    const result = parseXmlTags(input);

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('markdown');
    expect(result[0].content).toBe('Here is a chart: ');

    expect(result[1].type).toBe('component');
    expect(result[1].tagName).toBe('InteractiveVenn');
    expect(result[1].props).toEqual({
      a: 0.5,
      b: 0.4,
      ab: 0.2,
      isVisible: true,
      title: 'Test',
    });
  });

  it('should parse complex JSON props', () => {
    const input = '<Chart data={[1, 2, 3]} config={{"color": "red"}} />';
    const result = parseXmlTags(input);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('component');
    expect(result[0].tagName).toBe('Chart');
    expect(result[0].props).toEqual({
      data: [1, 2, 3],
      config: { color: 'red' },
    });
  });

  it('should parse tags with children correctly', () => {
    const input = '<Alert type="warning">This is an alert!</Alert>';
    const result = parseXmlTags(input);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('component');
    expect(result[0].tagName).toBe('Alert');
    expect(result[0].props).toEqual({ type: 'warning' });
    expect(result[0].childrenText).toBe('This is an alert!');
  });

  it('should fallback to markdown if parsing fails', () => {
    // Malformed tag
    const input = '<BrokenTag a={1> some text';
    const result = parseXmlTags(input);

    expect(result.length).toBeGreaterThan(0);
    // Since it doesn't match the regex strictly, the whole thing might be parsed as markdown
    expect(result[0].type).toBe('markdown');
  });

  it('should handle mixed content robustly', () => {
    const input = 'Start <Component prop=1 /> Middle <Another /> End';
    const result = parseXmlTags(input);

    expect(result).toHaveLength(5);
    expect(result[0].content).toBe('Start ');
    expect(result[1].tagName).toBe('Component');
    expect(result[2].content).toBe(' Middle ');
    expect(result[3].tagName).toBe('Another');
    expect(result[4].content).toBe(' End');
  });
});
