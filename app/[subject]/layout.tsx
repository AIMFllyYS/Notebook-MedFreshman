import AppShell from "@/components/layout/AppShell";

export default function SubjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
