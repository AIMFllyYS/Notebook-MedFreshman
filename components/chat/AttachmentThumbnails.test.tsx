import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AttachmentThumbnails from './AttachmentThumbnails';

describe('AttachmentThumbnails', () => {
  it('renders image and document attachments in one embedded shelf and removes by source index', () => {
    const onRemove = vi.fn();
    const { container } = render(<AttachmentThumbnails embedded onRemove={onRemove} previews={[
      {
        type: 'image', file: new File(['image'], 'cell.png', { type: 'image/png' }),
        previewUrl: 'blob:cell', base64: 'data:image/png;base64,aQ==', mimeType: 'image/png',
      },
      {
        type: 'document', file: new File(['# 重点'], 'review.md', { type: 'text/markdown' }),
        name: 'review.md', mimeType: 'text/markdown', text: '# 重点', size: 8, characterCount: 4,
      },
    ]} />);

    expect(container.querySelector('.chat-attachment-shelf-embedded')).toBeInTheDocument();
    expect(screen.getByAltText('cell.png')).toBeVisible();
    expect(screen.getByText('review.md')).toBeVisible();
    expect(screen.getByText('MD')).toBeVisible();
    expect(screen.getByText('4 字')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '移除附件 review.md' }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders persisted DOCX metadata without loading its full text into the message card', () => {
    render(<AttachmentThumbnails readonlyAttachments={[{
      id: 'blob-doc', type: 'document',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'lecture.docx', size: 2048, characterCount: 1200,
    }]} />);
    expect(screen.getByText('lecture.docx')).toBeVisible();
    expect(screen.getByText('DOCX')).toBeVisible();
    expect(screen.getByText('1,200 字')).toBeVisible();
  });

  it('shows concise format labels for HTML and YAML aliases', () => {
    render(<AttachmentThumbnails readonlyAttachments={[
      { id: 'blob-html', type: 'document', mimeType: 'text/html', name: 'chapter.htm', size: 120, characterCount: 80 },
      { id: 'blob-yaml', type: 'document', mimeType: 'application/yaml', name: 'outline.yml', size: 90, characterCount: 50 },
    ]} />);
    expect(screen.getByText('HTML')).toBeVisible();
    expect(screen.getByText('YAML')).toBeVisible();
  });
});
