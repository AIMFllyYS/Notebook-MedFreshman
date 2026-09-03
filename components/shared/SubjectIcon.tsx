import { createElement } from "react";
import { subjectIconName } from "@/lib/content-data/subjects.registry";
import { subjectIconComponent } from "@/lib/ui/subjectIcons";

interface SubjectIconProps {
  /** 学科 id；与 iconName 二选一，同时给时 iconName 优先。 */
  subjectId?: string;
  /** 直接指定 lucide 图标名（如 manifest / navTree 已带 icon 字段时）。 */
  iconName?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** 统一的学科图标；替代各组件自维护的 ICON_MAP。 */
export default function SubjectIcon({ subjectId, iconName, size = 16, className, style }: SubjectIconProps) {
  const name = iconName ?? (subjectId ? subjectIconName(subjectId) : "Folder");
  // 图标组件来自模块级常量表（非渲染期新建），用 createElement 避免被 static-components 规则误判。
  return createElement(subjectIconComponent(name), { size, className, style });
}
