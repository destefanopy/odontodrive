import React from 'react';
import Sidebar from "@/ui/components/Sidebar";
import Header from "@/ui/components/Header";

// Note: Re-using the Dashboard Sidebar and Header, but conceptually this is an admin zone.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-8 pt-4 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
