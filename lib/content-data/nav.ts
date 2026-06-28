import type { ContentTree } from '@/lib/types/content';
import nav from './nav.generated.json';

/** 侧边栏/设置等 UI 用的轻量导航树（无正文）。完整 manifest 仍见 manifest.ts。 */
export const navTree = nav as ContentTree;
