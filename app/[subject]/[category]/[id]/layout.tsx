import AppShell from "@/components/layout/AppShell";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
