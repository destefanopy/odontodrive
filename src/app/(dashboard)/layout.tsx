import Sidebar from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 pt-2 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
