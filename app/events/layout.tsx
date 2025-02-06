import { SiteHeader } from "@/components/site-header";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}
