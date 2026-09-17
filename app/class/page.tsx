import type { Metadata } from "next";
import ClassPlaceholder from "@/components/layout/ClassPlaceholder";
import { appModeTitle } from "@/lib/constants/app-mode";

export const metadata: Metadata = {
  title: appModeTitle("class"),
};

export default function ClassPage() {
  return <ClassPlaceholder />;
}
