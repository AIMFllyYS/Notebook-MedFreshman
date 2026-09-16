import type { SVGProps } from "react";

interface NotebookFormulaIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
}

/** 个人笔记：折角笔记本 + 一枚 Σ 记号（区别于 lucide 的 BookOpen / FileDigit）。 */
export default function NotebookFormulaIcon({ size = 24, ...props }: NotebookFormulaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7z" />
      <path d="M15 3v4h4" />
      <path d="M8 3v18" />
      <path d="M14.5 10.5h-4l2.2 3-2.2 3h4" />
    </svg>
  );
}
