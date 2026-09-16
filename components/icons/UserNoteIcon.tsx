import type { SVGProps } from "react";

interface UserNoteIconProps extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  size?: number;
}

/** 摊开的笔记本 + 一支笔 + 一段 f(x) 曲线：一眼看出是「可写公式的笔记」。 */
export default function UserNoteIcon({ size = 24, ...props }: UserNoteIconProps) {
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
      {/* 摊开的左页与书脊 */}
      <path d="M12 6.6C10.6 5.3 8.7 4.6 6.1 4.6H3V16.6h3.1c2.5 0 4.4.7 5.9 2" />
      <path d="M12 6.6V18.6" />
      {/* 右页（下缘留给笔） */}
      <path d="M12 6.6c1.5-1.3 3.4-2 5.9-2H21v6.6" />
      {/* 左页上的公式感曲线（积分号 / f(x) 的那一撇） */}
      <path d="M8.9 8.8c-1 0-1.3.8-1.5 2-.3 1.8-.5 3.1-1.7 3.1" />
      <path d="M6.2 11.2h3" />
      {/* 压在右页外缘的笔 */}
      <path d="M20.8 13.6a1.7 1.7 0 0 1 2.4 2.4l-4.3 4.3-2.9.5.5-2.9z" />
    </svg>
  );
}
