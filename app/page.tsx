import { redirect } from "next/navigation";
import { DEFAULT_SUBJECT, DEFAULT_CATEGORY } from "@/lib/constants/subjects";

export default function Page() {
  redirect(`/${DEFAULT_SUBJECT}/${DEFAULT_CATEGORY}/1.1`);
}
