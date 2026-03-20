"use client";

import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-background flex items-center justify-between px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=JanaSantander&backgroundColor=e6f7fa"
            alt="Dra. Avatar"
            className="w-full h-full object-cover p-1 bg-white"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900">
              Dra. Jana Santander
            </span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            jana.santander@example.com
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="pl-11 pr-4 py-2.5 rounded-full border-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 w-72 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all"
          />
        </div>
        <button className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:scale-105 active:scale-95">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white box-content shadow-sm"></span>
        </button>
      </div>
    </header>
  );
}
