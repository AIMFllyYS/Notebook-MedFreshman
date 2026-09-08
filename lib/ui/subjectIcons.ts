// 学科图标白名单：唯一允许把 lucide 学科图标名映射到组件的位置。
// SubjectMeta.icon 的类型是 SubjectIconName，registry 写错名字会直接被 tsc 拦住。
import {
  Atom,
  Bone,
  BookOpen,
  Calculator,
  ChartColumn,
  Dna,
  FlaskConical,
  Folder,
  FolderOpen,
  Languages,
  Layers,
  Microscope,
  Scale,
  ScanLine,
  ScrollText,
} from "lucide-react";

export const SUBJECT_ICON_COMPONENTS = {
  Atom,
  Bone,
  BookOpen,
  Calculator,
  ChartColumn,
  Dna,
  FlaskConical,
  Folder,
  FolderOpen,
  Languages,
  Layers,
  Microscope,
  Scale,
  ScanLine,
  ScrollText,
} as const;

export type SubjectIconName = keyof typeof SUBJECT_ICON_COMPONENTS;

export type SubjectIconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}>;

export function isSubjectIconName(name: string): name is SubjectIconName {
  return Object.prototype.hasOwnProperty.call(SUBJECT_ICON_COMPONENTS, name);
}

/** 按图标名取组件；未知名字回退 Folder。 */
export function subjectIconComponent(name: string): SubjectIconComponent {
  return (isSubjectIconName(name) ? SUBJECT_ICON_COMPONENTS[name] : Folder) as SubjectIconComponent;
}
